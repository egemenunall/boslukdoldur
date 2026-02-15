'use client';

import { Player } from '@/lib/types';

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function GameLobby({ roomCode, players, isHost, onStartGame }: GameLobbyProps) {
  const canStart = players.length >= 2;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Basit feedback
    const button = document.getElementById('copy-button');
    if (button) {
      button.innerText = 'Kopyalandı!';
      setTimeout(() => {
        button.innerText = 'Kopyala';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hsd-dark via-hsd-primary to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <div className="inline-block bg-white px-6 py-3 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-black text-hsd-primary">HSD DEU</h1>
            </div>
          </div>
          
          {/* Room Code */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <p className="text-gray-500 text-sm mb-2 font-medium">Oda Kodu</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-black text-hsd-primary tracking-[0.3em]">
                {roomCode}
              </span>
              <button
                id="copy-button"
                onClick={copyRoomCode}
                className="px-4 py-2 bg-hsd-primary hover:bg-hsd-dark text-white rounded-lg transition-all font-semibold text-sm"
              >
                Kopyala
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Arkadaşlarınla paylaş!
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Oyuncular</h2>
            <span className="px-3 py-1 bg-red-100 text-hsd-primary rounded-full font-bold text-sm">
              {players.length} Kişi
            </span>
          </div>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-hsd-primary to-hsd-dark rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{player.name}</p>
                    {player.isHost && (
                      <span className="text-xs text-hsd-accent font-semibold">
                        👑 Host
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 font-medium">Hazır</span>
                </div>
              </div>
            ))}
          </div>

          {/* Waiting Animation */}
          {players.length < 2 && (
            <div className="mt-4 text-center py-3">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="ml-2">Oyuncular bekleniyor...</span>
              </div>
            </div>
          )}
        </div>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform shadow-xl ${
              canStart
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canStart ? '🚀 Oyunu Başlat' : '⏳ En az 2 oyuncu gerekli'}
          </button>
        )}

        {/* Waiting for Host */}
        {!isHost && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white font-medium">
              ⏳ Host oyunu başlatıyor...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
