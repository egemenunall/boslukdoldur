'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Room, GameState, Question, Answer, PlayerScore } from '@/lib/types';
import GameLobby from '@/components/GameLobby';
import QuestionRound from '@/components/QuestionRound';
import VotingRound from '@/components/VotingRound';
import ScoreBoard from '@/components/ScoreBoard';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    let timeoutId: NodeJS.Timeout;

    // Initial connection state'ini kontrol et
    setIsConnected(socket.connected);

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Room page: Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Room page: Socket disconnected');
    });

    socket.on('roomJoined', (data) => {
      console.log('Room joined event received:', data);
      setRoom(data.room);
      setPlayerId(data.playerId);
      localStorage.removeItem('pendingRoom'); // Temizle
    });

    // Eğer 2 saniye içinde room bilgisi gelmezse, localStorage'dan tekrar dene
    timeoutId = setTimeout(() => {
      if (!room && socket.connected) {
        const pendingRoom = localStorage.getItem('pendingRoom');
        const playerName = localStorage.getItem('playerName');
        
        if (pendingRoom === roomCode && playerName) {
          console.log('Retrying join with stored credentials');
          socket.emit('joinRoom', { 
            code: roomCode, 
            name: playerName 
          }, (response) => {
            if (!response.success) {
              console.error('Failed to rejoin:', response.error);
              setError('Odaya katılamadınız. Ana sayfaya yönlendiriliyorsunuz...');
              setTimeout(() => router.push('/'), 2000);
            }
          });
        } else {
          console.log('No pending room, redirecting to home');
          setError('Oda bilgisi bulunamadı. Ana sayfaya yönlendiriliyorsunuz...');
          setTimeout(() => router.push('/'), 2000);
        }
      }
    }, 2000);

    socket.on('playerJoined', (data) => {
      setRoom((prev) => {
        if (!prev) return null;
        // Oyuncu zaten listede mi kontrol et
        const playerExists = prev.players.some(p => p.id === data.player.id);
        if (playerExists) {
          console.log('Player already exists, skipping add:', data.player.id);
          return prev;
        }
        console.log('Adding new player:', data.player.name);
        return {
          ...prev,
          players: [...prev.players, data.player],
        };
      });
    });

    socket.on('playerLeft', (data) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.filter(p => p.id !== data.playerId),
        };
      });
    });

    socket.on('gameStarted', (data) => {
      setCurrentQuestion(data.question);
      setCurrentRound(data.round);
      setTotalRounds(data.totalRounds);
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, state: GameState.QUESTION_ROUND };
      });
    });

    socket.on('allAnswersSubmitted', () => {
      // Tüm cevaplar alındı, oylama başlayacak
    });

    socket.on('votingStarted', (data) => {
      setAnswers(data.answers);
      setCurrentQuestion(data.question);
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, state: GameState.VOTING_ROUND };
      });
    });

    socket.on('roundEnd', (data) => {
      setScores(data.scores);
      setCorrectAnswer(data.correctAnswer);
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, state: GameState.SCORE_DISPLAY };
      });
    });

    socket.on('gameEnd', (data) => {
      setScores(data.finalScores);
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, state: GameState.GAME_END };
      });
    });

    socket.on('roomState', (data) => {
      setRoom(data.room);
    });

    socket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      clearTimeout(timeoutId);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameStarted');
      socket.off('allAnswersSubmitted');
      socket.off('votingStarted');
      socket.off('roundEnd');
      socket.off('gameEnd');
      socket.off('roomState');
      socket.off('error');
    };
  }, [room, roomCode, router]);

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('startGame', (response) => {
      if (!response.success) {
        setError(response.error || 'Oyun başlatılamadı');
      }
    });
  };

  const handleSubmitAnswer = (answer: string) => {
    const socket = getSocket();
    socket.emit('submitAnswer', { answer }, (response) => {
      if (!response.success) {
        setError(response.error || 'Cevap gönderilemedi');
      }
    });
  };

  const handleSubmitVote = (answerId: string) => {
    const socket = getSocket();
    socket.emit('submitVote', { answerId }, (response) => {
      if (!response.success) {
        setError(response.error || 'Oy gönderilemedi');
      }
    });
  };

  const handleNextRound = () => {
    const socket = getSocket();
    socket.emit('nextRound', (response) => {
      if (!response.success) {
        setError(response.error || 'Sonraki tura geçilemedi');
      }
    });
  };

  // Loading state
  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">
            {isConnected ? 'Odaya bağlanılıyor...' : 'Sunucuya bağlanılıyor...'}
          </p>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === playerId;

  // Render based on game state
  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg">
            {error}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Bağlantı koptu...
          </div>
        </div>
      )}

      {/* Game States */}
      {room.state === GameState.LOBBY && (
        <GameLobby
          roomCode={roomCode}
          players={room.players}
          isHost={isHost}
          onStartGame={handleStartGame}
        />
      )}

      {room.state === GameState.QUESTION_ROUND && currentQuestion && (
        <QuestionRound
          question={currentQuestion}
          round={currentRound}
          totalRounds={totalRounds}
          onSubmitAnswer={handleSubmitAnswer}
        />
      )}

      {room.state === GameState.VOTING_ROUND && currentQuestion && (
        <VotingRound
          question={currentQuestion}
          answers={answers}
          onSubmitVote={handleSubmitVote}
        />
      )}

      {room.state === GameState.SCORE_DISPLAY && (
        <ScoreBoard
          scores={scores}
          correctAnswer={correctAnswer}
          isHost={isHost}
          isGameEnd={false}
          onNextRound={handleNextRound}
        />
      )}

      {room.state === GameState.GAME_END && (
        <ScoreBoard
          scores={scores}
          correctAnswer={correctAnswer}
          isHost={isHost}
          isGameEnd={true}
        />
      )}
    </>
  );
}
