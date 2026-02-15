'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/types';
import Timer from './Timer';

interface QuestionRoundProps {
  question: Question;
  round: number;
  totalRounds: number;
  onSubmitAnswer: (answer: string) => void;
}

export default function QuestionRound({ 
  question, 
  round, 
  totalRounds, 
  onSubmitAnswer 
}: QuestionRoundProps) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswer('');
    setSubmitted(false);
  }, [question]);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmitAnswer(answer.trim());
      setSubmitted(true);
    }
  };

  const handleTimeUp = () => {
    if (!submitted) {
      onSubmitAnswer(answer.trim() || '...');
      setSubmitted(true);
    }
  };

  // Boşluğu vurgula
  const renderQuestion = () => {
    const parts = question.text.split('___');
    return (
      <span className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
        {parts[0]}
        <span className="inline-block mx-2 px-4 py-1 bg-yellow-200 border-2 border-yellow-400 rounded-lg text-yellow-800">
          ___
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hsd-primary via-hsd-secondary to-hsd-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <span className="text-lg font-bold text-hsd-accent">
              Tur {round} / {totalRounds}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Timer */}
          <div className="flex justify-center">
            <Timer duration={30} onComplete={handleTimeUp} />
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-hsd-light to-blue-50 border-2 border-hsd-secondary rounded-2xl p-6 min-h-[120px] flex items-center justify-center">
            {renderQuestion()}
          </div>

          {/* Answer Input */}
          {!submitted ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cevabınızı yazın
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Boşluğu doldurun..."
                  className="w-full px-4 py-4 border-2 border-hsd-light rounded-xl focus:outline-none focus:border-hsd-secondary transition-colors text-lg"
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  {answer.length}/50 karakter
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                  answer.trim()
                    ? 'bg-gradient-to-r from-hsd-accent to-orange-600 text-white hover:from-orange-600 hover:to-hsd-accent hover:scale-105 active:scale-95 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Cevabı Gönder
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Submitted State */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-green-800 font-semibold text-lg mb-2">
                  Cevabınız gönderildi!
                </p>
                <p className="text-green-600">
                  Diğer oyuncular bekleniyor...
                </p>
              </div>

              {/* Your Answer */}
              <div className="bg-hsd-light rounded-xl p-4">
                <p className="text-sm text-hsd-primary mb-1">Sizin cevabınız:</p>
                <p className="text-lg font-semibold text-gray-800">{answer || '(Boş)'}</p>
              </div>

              {/* Loading Animation */}
              <div className="flex justify-center items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-hsd-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="text-center mt-6 text-white text-sm">
          <p className="font-semibold mb-1">💡 Nasıl Oynanır?</p>
          <p>Doğru cevabı BİLMİYORMUŞ gibi yaparak yalan bir cevap yaz!</p>
          <p className="mt-1">Diğer oyuncuları kandır ve puan kazan! 😈</p>
        </div>
      </div>
    </div>
  );
}
