'use client';

import { useState, useEffect } from 'react';
import { Answer, Question } from '@/lib/types';
import Timer from './Timer';

interface VotingRoundProps {
  question: Question;
  answers: Answer[];
  onSubmitVote: (answerId: string) => void;
}

export default function VotingRound({ question, answers, onSubmitVote }: VotingRoundProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
  }, [question]);

  const handleVote = (answerId: string) => {
    if (!submitted) {
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      onSubmitVote(selectedAnswer);
      setSubmitted(true);
    }
  };

  const handleTimeUp = () => {
    if (!submitted && selectedAnswer) {
      onSubmitVote(selectedAnswer);
      setSubmitted(true);
    } else if (!submitted) {
      // Random seçim yap
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      onSubmitVote(randomAnswer.id);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hsd-primary via-hsd-secondary to-hsd-dark flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <span className="text-lg font-bold text-hsd-secondary">
              Oylama Zamanı
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Timer */}
          <div className="flex justify-center">
            <Timer duration={20} onComplete={handleTimeUp} />
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-hsd-accent rounded-2xl p-6 text-center">
            <p className="text-xl font-semibold text-gray-800">
              {question.text}
            </p>
          </div>

          {/* Instructions */}
          {!submitted && (
            <div className="bg-hsd-light border-2 border-hsd-secondary rounded-xl p-4">
              <p className="text-hsd-primary font-bold text-center mb-2">
                🎯 Hangisi GERÇEK doğru cevap?
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Tüm oyuncuların tahminleri + 1 gerçek cevap</p>
                <p>• Kendi cevabını göremezsin</p>
                <p className="font-semibold text-hsd-accent">💰 Doğruyu seçersen +1 puan!</p>
              </div>
            </div>
          )}

          {/* Answers */}
          <div className="space-y-3">
            {answers.map((answer, index) => (
              <button
                key={answer.id}
                onClick={() => handleVote(answer.id)}
                disabled={submitted}
                className={`w-full p-4 rounded-xl text-left transition-all transform ${
                  submitted
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:scale-102 active:scale-98'
                } ${
                  selectedAnswer === answer.id
                    ? 'bg-gradient-to-r from-hsd-accent to-orange-600 text-white shadow-lg scale-102'
                    : 'bg-gray-50 hover:bg-hsd-light border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      selectedAnswer === answer.id
                        ? 'bg-white text-hsd-accent'
                        : 'bg-hsd-light text-hsd-primary'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={`font-semibold text-lg ${
                    selectedAnswer === answer.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {answer.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                selectedAnswer
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Oyu Gönder
            </button>
          )}

          {/* Submitted State */}
          {submitted && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">✓</div>
              <p className="text-green-800 font-semibold text-lg mb-2">
                Oyunuz kaydedildi!
              </p>
              <p className="text-green-600">
                Diğer oyuncular bekleniyor...
              </p>
              
              {/* Loading Animation */}
              <div className="flex justify-center items-center gap-2 mt-4 text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
