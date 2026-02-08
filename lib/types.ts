// Game States
export enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_ROUND = 'QUESTION_ROUND',
  VOTING_ROUND = 'VOTING_ROUND',
  SCORE_DISPLAY = 'SCORE_DISPLAY',
  GAME_END = 'GAME_END',
}

// Player Interface
export interface Player {
  id: string;
  name: string;
  score: number;
  answer?: string;
  votedFor?: string;
  isHost?: boolean;
}

// Question Interface
export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
}

// Answer Interface (for voting)
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  playerId?: string; // undefined if it's the correct answer
}

// Room Interface
export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  state: GameState;
  currentQuestion?: Question;
  currentRound: number;
  totalRounds: number;
  answers: Answer[];
  usedQuestionIds: string[];
}

// Score Display Interface
export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  roundScore: number;
  isCorrect?: boolean;
  votesReceived?: number;
}

// Socket Event Types
export interface ServerToClientEvents {
  roomCreated: (data: { code: string }) => void;
  roomJoined: (data: { room: Room; playerId: string }) => void;
  playerJoined: (data: { player: Player }) => void;
  playerLeft: (data: { playerId: string }) => void;
  gameStarted: (data: { question: Question; round: number; totalRounds: number }) => void;
  allAnswersSubmitted: () => void;
  votingStarted: (data: { answers: Answer[]; question: Question }) => void;
  roundEnd: (data: { scores: PlayerScore[]; correctAnswer: string }) => void;
  gameEnd: (data: { finalScores: PlayerScore[] }) => void;
  error: (data: { message: string }) => void;
  roomState: (data: { room: Room }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { name: string }, callback: (response: { success: boolean; code?: string; error?: string }) => void) => void;
  joinRoom: (data: { code: string; name: string }, callback: (response: { success: boolean; playerId?: string; error?: string }) => void) => void;
  startGame: (callback: (response: { success: boolean; error?: string }) => void) => void;
  submitAnswer: (data: { answer: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  submitVote: (data: { answerId: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  nextRound: (callback: (response: { success: boolean; error?: string }) => void) => void;
  endGame: (callback: (response: { success: boolean; error?: string }) => void) => void;
}
