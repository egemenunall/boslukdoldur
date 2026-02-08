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
    <div className="min-h-screen bg-gradient-to-br from-hsd-primary via-hsd-secondary to-hsd-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-block bg-white px-6 py-3 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-black text-hsd-primary">HSD DEU</h1>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Oyun Lobisi
          </h2>
          
          {/* Room Code */}
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
            <p className="text-gray-600 text-sm mb-2">Oda Kodu</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-bold text-hsd-secondary tracking-wider">
                {roomCode}
              </span>
              <button
                id="copy-button"
                onClick={copyRoomCode}
                className="px-4 py-2 bg-hsd-light hover:bg-hsd-secondary hover:text-white text-hsd-primary rounded-lg transition-colors font-medium"
              >
                Kopyala
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Arkadaşlarınızla bu kodu paylaşın
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Oyuncular</h2>
            <span className="px-4 py-2 bg-hsd-light text-hsd-primary rounded-full font-semibold">
              {players.length} Oyuncu
            </span>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-hsd-light to-blue-50 rounded-xl border-2 border-hsd-light"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-hsd-primary to-hsd-accent rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{player.name}</p>
                    {player.isHost && (
                      <span className="text-xs text-hsd-accent font-medium">
                        👑 Host
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500">Hazır</span>
                </div>
              </div>
            ))}
          </div>

          {/* Waiting Animation */}
          {players.length < 2 && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
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
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                canStart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canStart ? 'Oyunu Başlat' : 'En az 2 oyuncu gerekli'}
            </button>
            
            {!canStart && (
              <p className="text-center text-gray-500 text-sm mt-3">
                Oyunu başlatmak için en az 2 oyuncu olmalı
              </p>
            )}
          </div>
        )}

        {/* Waiting for Host */}
        {!isHost && (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <p className="text-gray-600">
              Host oyunu başlatmasını bekliyor...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
