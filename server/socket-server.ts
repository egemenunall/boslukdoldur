import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { 
  Room, 
  Player, 
  GameState, 
  Answer, 
  PlayerScore,
  ClientToServerEvents,
  ServerToClientEvents 
} from '../lib/types';
import { getRandomQuestion } from '../lib/questions';

// In-memory storage
const rooms = new Map<string, Room>();

// Timeout references
const timeouts = new Map<string, NodeJS.Timeout>();

// Helper: Generate unique room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// Helper: Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper: Clear timeout for room
function clearRoomTimeout(roomCode: string) {
  const timeout = timeouts.get(roomCode);
  if (timeout) {
    clearTimeout(timeout);
    timeouts.delete(roomCode);
  }
}

// Helper: Calculate scores (Zarta/Psych! mantığı)
function calculateScores(room: Room): PlayerScore[] {
  const scores: PlayerScore[] = [];
  
  room.players.forEach(player => {
    const roundScore = { roundScore: 0, votesReceived: 0, isCorrect: false };
    
    // Doğru cevabı seçtiyse +1 puan (Zarta'da böyle)
    if (player.votedFor === 'correct') {
      roundScore.roundScore += 1;
      roundScore.isCorrect = true;
    }
    
    // Başka oyuncular bu oyuncunun cevabını seçtiyse
    // Her kandırılan oyuncu için +1 puan
    if (player.answer) {
      const votesReceived = room.players.filter(
        p => p.votedFor === player.id && p.id !== player.id // Kendisi hariç
      ).length;
      roundScore.roundScore += votesReceived;
      roundScore.votesReceived = votesReceived;
    }
    
    // Update player's total score
    player.score += roundScore.roundScore;
    
    scores.push({
      id: player.id,
      name: player.name,
      score: player.score,
      roundScore: roundScore.roundScore,
      isCorrect: roundScore.isCorrect,
      votesReceived: roundScore.votesReceived,
    });
  });
  
  return scores.sort((a, b) => b.score - a.score);
}

// Helper: Start voting phase
function startVotingPhase(io: SocketIOServer, room: Room) {
  if (!room.currentQuestion) return;
  
  // Create answers array with players' answers + correct answer
  const answers: Answer[] = [
    {
      id: 'correct',
      text: room.currentQuestion.correctAnswer,
      isCorrect: true,
    }
  ];
  
  // Add players' answers
  room.players.forEach(player => {
    if (player.answer && player.answer.trim()) {
      answers.push({
        id: player.id,
        text: player.answer,
        isCorrect: false,
        playerId: player.id,
      });
    }
  });
  
  // Shuffle answers
  room.answers = shuffleArray(answers);
  room.state = GameState.VOTING_ROUND;
  
  // Her oyuncuya KENDİ cevabı HARİÇ cevapları gönder
  room.players.forEach(player => {
    const filteredAnswers = room.answers.filter(a => a.playerId !== player.id);
    io.to(player.id).emit('votingStarted', {
      answers: filteredAnswers,
      question: room.currentQuestion!,
    });
  });
  
  // Set timeout for voting (20 seconds)
  clearRoomTimeout(room.code);
  const timeout = setTimeout(() => {
    endVotingPhase(io, room);
  }, 20000);
  timeouts.set(room.code, timeout);
}

// Helper: End voting phase
function endVotingPhase(io: SocketIOServer, room: Room) {
  if (!room.currentQuestion) return;
  
  clearRoomTimeout(room.code);
  
  // Calculate scores
  const scores = calculateScores(room);
  
  room.state = GameState.SCORE_DISPLAY;
  
  io.to(room.code).emit('roundEnd', {
    scores,
    correctAnswer: room.currentQuestion.correctAnswer,
  });
  
  // Reset answers and votes for next round
  room.players.forEach(player => {
    player.answer = undefined;
    player.votedFor = undefined;
  });
  room.answers = [];
}

// Helper: Start next round or end game
function startNextRound(io: SocketIOServer, room: Room) {
  if (room.currentRound >= room.totalRounds) {
    // Game end
    room.state = GameState.GAME_END;
    const finalScores = room.players
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        roundScore: 0,
      }))
      .sort((a, b) => b.score - a.score);
    
    io.to(room.code).emit('gameEnd', { finalScores });
    return;
  }
  
  // Next round
  room.currentRound++;
  const question = getRandomQuestion(room.usedQuestionIds);
  
  if (!question) {
    // No more questions
    room.state = GameState.GAME_END;
    const finalScores = room.players
      .map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        roundScore: 0,
      }))
      .sort((a, b) => b.score - a.score);
    
    io.to(room.code).emit('gameEnd', { finalScores });
    return;
  }
  
  room.currentQuestion = question;
  room.usedQuestionIds.push(question.id);
  room.state = GameState.QUESTION_ROUND;
  
  io.to(room.code).emit('gameStarted', {
    question,
    round: room.currentRound,
    totalRounds: room.totalRounds,
  });
  
  // Set timeout for answers (30 seconds)
  clearRoomTimeout(room.code);
  const timeout = setTimeout(() => {
    startVotingPhase(io, room);
  }, 30000);
  timeouts.set(room.code, timeout);
}

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    // Create Room
    socket.on('createRoom', (data, callback) => {
      try {
        const roomCode = generateRoomCode();
        const player: Player = {
          id: socket.id,
          name: data.name,
          score: 0,
          isHost: true,
        };

        const room: Room = {
          code: roomCode,
          hostId: socket.id,
          players: [player],
          state: GameState.LOBBY,
          currentRound: 0,
          totalRounds: 10,
          answers: [],
          usedQuestionIds: [],
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        currentRoomCode = roomCode;
        currentPlayerId = socket.id;

        callback({ success: true, code: roomCode });
        socket.emit('roomJoined', { room, playerId: socket.id });
      } catch (error) {
        callback({ success: false, error: 'Oda oluşturulamadı' });
      }
    });

    // Join Room
    socket.on('joinRoom', (data, callback) => {
      try {
        const room = rooms.get(data.code.toUpperCase());
        
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        if (room.state !== GameState.LOBBY) {
          callback({ success: false, error: 'Oyun başlamış, katılamazsınız' });
          return;
        }
        
        // Oyuncu zaten odada mı kontrol et
        const existingPlayer = room.players.find(p => p.id === socket.id);
        if (existingPlayer) {
          console.log('Player already in room, sending current state:', socket.id);
          callback({ success: true, playerId: socket.id });
          socket.emit('roomJoined', { room, playerId: socket.id });
          return;
        }
        
        const player: Player = {
          id: socket.id,
          name: data.name,
          score: 0,
          isHost: false,
        };
        
        room.players.push(player);
        socket.join(room.code);
        currentRoomCode = room.code;
        currentPlayerId = socket.id;
        
        callback({ success: true, playerId: socket.id });
        socket.emit('roomJoined', { room, playerId: socket.id });
        socket.to(room.code).emit('playerJoined', { player });
      } catch (error) {
        callback({ success: false, error: 'Odaya katılınamadı' });
      }
    });

    // Start Game
    socket.on('startGame', (callback) => {
      try {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Bir odada değilsiniz' });
          return;
        }
        
        const room = rooms.get(currentRoomCode);
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Sadece host oyunu başlatabilir' });
          return;
        }
        
        if (room.players.length < 2) {
          callback({ success: false, error: 'En az 2 oyuncu gerekli' });
          return;
        }
        
        room.currentRound = 1;
        const question = getRandomQuestion();
        
        if (!question) {
          callback({ success: false, error: 'Soru bulunamadı' });
          return;
        }
        
        room.currentQuestion = question;
        room.usedQuestionIds.push(question.id);
        room.state = GameState.QUESTION_ROUND;
        
        io.to(room.code).emit('gameStarted', {
          question,
          round: room.currentRound,
          totalRounds: room.totalRounds,
        });
        
        callback({ success: true });
        
        // Set timeout for answers (30 seconds)
        const timeout = setTimeout(() => {
          startVotingPhase(io, room);
        }, 30000);
        timeouts.set(room.code, timeout);
      } catch (error) {
        callback({ success: false, error: 'Oyun başlatılamadı' });
      }
    });

    // Submit Answer
    socket.on('submitAnswer', (data, callback) => {
      try {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Bir odada değilsiniz' });
          return;
        }
        
        const room = rooms.get(currentRoomCode);
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        const player = room.players.find(p => p.id === socket.id);
        if (!player) {
          callback({ success: false, error: 'Oyuncu bulunamadı' });
          return;
        }
        
        const trimmedAnswer = data.answer.trim().toLowerCase();
        
        // Doğru cevap kontrolü
        if (room.currentQuestion && 
            trimmedAnswer === room.currentQuestion.correctAnswer.toLowerCase()) {
          callback({ success: false, error: 'Gerçek doğru cevabı yazdın! Başka bir şey dene 😉' });
          return;
        }
        
        // Duplicate cevap kontrolü (diğer oyuncular)
        const isDuplicate = room.players.some(p => 
          p.id !== socket.id && 
          p.answer && 
          p.answer.toLowerCase() === trimmedAnswer
        );
        
        if (isDuplicate) {
          callback({ success: false, error: 'Bu cevap başka bir oyuncu tarafından yazılmış!' });
          return;
        }
        
        player.answer = data.answer.trim();
        callback({ success: true });
        
        // Check if all players submitted
        const allSubmitted = room.players.every(p => p.answer !== undefined);
        if (allSubmitted) {
          clearRoomTimeout(room.code);
          io.to(room.code).emit('allAnswersSubmitted');
          setTimeout(() => startVotingPhase(io, room), 1000);
        }
      } catch (error) {
        callback({ success: false, error: 'Cevap gönderilemedi' });
      }
    });

    // Submit Vote
    socket.on('submitVote', (data, callback) => {
      try {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Bir odada değilsiniz' });
          return;
        }
        
        const room = rooms.get(currentRoomCode);
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        const player = room.players.find(p => p.id === socket.id);
        if (!player) {
          callback({ success: false, error: 'Oyuncu bulunamadı' });
          return;
        }
        
        player.votedFor = data.answerId;
        callback({ success: true });
        
        // Check if all players voted
        const allVoted = room.players.every(p => p.votedFor !== undefined);
        if (allVoted) {
          clearRoomTimeout(room.code);
          setTimeout(() => endVotingPhase(io, room), 1000);
        }
      } catch (error) {
        callback({ success: false, error: 'Oy gönderilemedi' });
      }
    });

    // Next Round
    socket.on('nextRound', (callback) => {
      try {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Bir odada değilsiniz' });
          return;
        }
        
        const room = rooms.get(currentRoomCode);
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Sadece host sonraki tura geçebilir' });
          return;
        }
        
        callback({ success: true });
        startNextRound(io, room);
      } catch (error) {
        callback({ success: false, error: 'Sonraki tura geçilemedi' });
      }
    });

    // End Game
    socket.on('endGame', (callback) => {
      try {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Bir odada değilsiniz' });
          return;
        }
        
        const room = rooms.get(currentRoomCode);
        if (!room) {
          callback({ success: false, error: 'Oda bulunamadı' });
          return;
        }
        
        if (room.hostId !== socket.id) {
          callback({ success: false, error: 'Sadece host oyunu bitirebilir' });
          return;
        }
        
        room.state = GameState.GAME_END;
        const finalScores = room.players
          .map(p => ({
            id: p.id,
            name: p.name,
            score: p.score,
            roundScore: 0,
          }))
          .sort((a, b) => b.score - a.score);
        
        io.to(room.code).emit('gameEnd', { finalScores });
        callback({ success: true });
        
        clearRoomTimeout(room.code);
      } catch (error) {
        callback({ success: false, error: 'Oyun bitirilemedi' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      if (currentRoomCode) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          // Remove player
          room.players = room.players.filter(p => p.id !== socket.id);
          
          // Notify others
          io.to(currentRoomCode).emit('playerLeft', { playerId: socket.id });
          
          // If host left, assign new host or delete room
          if (room.hostId === socket.id) {
            if (room.players.length > 0) {
              room.hostId = room.players[0].id;
              room.players[0].isHost = true;
              io.to(currentRoomCode).emit('roomState', { room });
            } else {
              // Delete empty room
              clearRoomTimeout(currentRoomCode);
              rooms.delete(currentRoomCode);
            }
          }
          
          // If no players left, delete room
          if (room.players.length === 0) {
            clearRoomTimeout(currentRoomCode);
            rooms.delete(currentRoomCode);
          }
        }
      }
    });
  });

  return io;
}
