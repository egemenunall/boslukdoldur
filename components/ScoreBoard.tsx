'use client';

import { PlayerScore } from '@/lib/types';
import { useEffect, useState } from 'react';

interface ScoreBoardProps {
  scores: PlayerScore[];
  correctAnswer: string;
  isHost: boolean;
  isGameEnd: boolean;
  onNextRound?: () => void;
}

export default function ScoreBoard({ 
  scores, 
  correctAnswer, 
  isHost, 
  isGameEnd,
  onNextRound 
}: ScoreBoardProps) {
  const [animatedScores, setAnimatedScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    // Animasyonlu puan gösterimi
    setAnimatedScores(scores.map(s => ({ ...s, score: s.score - s.roundScore })));
    
    const timeout = setTimeout(() => {
      setAnimatedScores(scores);
    }, 500);

    return () => clearTimeout(timeout);
  }, [scores]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hsd-dark via-hsd-primary to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <span className="text-lg font-bold text-green-600">
              {isGameEnd ? '🏆 Oyun Bitti!' : '📊 Tur Sonu'}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Correct Answer */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-green-600 font-medium mb-2">Doğru Cevap</p>
            <p className="text-3xl font-bold text-green-700">{correctAnswer}</p>
          </div>

          {/* Scores */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isGameEnd ? 'Final Sıralaması' : 'Skor Tablosu'}
            </h2>
            
            {animatedScores.map((player, index) => (
              <div
                key={player.id}
                className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
                  index === 0 && isGameEnd
                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-4 border-hsd-accent'
                    : 'bg-gradient-to-r from-hsd-light to-blue-50 border-2 border-hsd-light'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      index === 0 && isGameEnd
                        ? 'bg-gradient-to-br from-hsd-accent to-orange-500 text-white'
                        : index === 1 && isGameEnd
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                        : index === 2 && isGameEnd
                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                        : 'bg-gradient-to-br from-hsd-primary to-hsd-secondary text-white'
                    }`}>
                      {index === 0 && isGameEnd ? '👑' : `#${index + 1}`}
                    </div>

                    {/* Player Name */}
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-800">{player.name}</p>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        {!isGameEnd && player.isCorrect && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            ✓ Doğru
                          </span>
                        )}
                        {!isGameEnd && player.votesReceived !== undefined && player.votesReceived > 0 && (
                          <span className="px-2 py-0.5 bg-hsd-light text-hsd-primary rounded-full font-medium">
                            +{player.votesReceived} oy
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="text-right">
                      {!isGameEnd && player.roundScore > 0 && (
                        <div className="text-green-600 font-bold text-lg mb-1">
                          +{player.roundScore}
                        </div>
                      )}
                      <div className="text-3xl font-bold text-hsd-primary">
                        {player.score}
                      </div>
                      <div className="text-xs text-gray-500">puan</div>
                    </div>
                  </div>
                </div>

                {/* Winner Confetti Effect */}
                {index === 0 && isGameEnd && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-hsd-accent via-orange-500 to-hsd-accent animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          {/* Next Round Button (Host Only) */}
          {!isGameEnd && isHost && onNextRound && (
            <button
              onClick={onNextRound}
              className="w-full bg-gradient-to-r from-hsd-primary to-hsd-secondary text-white font-bold py-4 rounded-xl hover:from-hsd-secondary hover:to-hsd-primary transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Sonraki Tur
            </button>
          )}

          {/* Game End Message */}
          {isGameEnd && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-hsd-accent rounded-xl p-6 text-center">
              <p className="text-xl font-bold text-gray-800 mb-2">
                Tebrikler {animatedScores[0]?.name}! 🎉
              </p>
              <p className="text-gray-600">
                Oyunu {animatedScores[0]?.score} puanla kazandın!
              </p>
              <p className="text-sm text-gray-500 mt-3">© HSD DEU Network</p>
            </div>
          )}

          {/* Waiting Message */}
          {!isGameEnd && !isHost && (
            <div className="bg-hsd-light border-2 border-hsd-secondary rounded-xl p-4 text-center">
              <p className="text-hsd-primary font-medium">
                Host sonraki tura geçmesini bekliyor...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
