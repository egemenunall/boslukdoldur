'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected!');
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected!');
    };
    
    setIsConnected(socket.connected);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (name.trim().length < 2) {
      setError('İsim en az 2 karakter olmalı');
      return;
    }

    setError('');
    setIsCreating(true);

    const socket = getSocket();
    
    // Socket bağlantısını bekle
    if (!socket.connected) {
      const waitForConnection = new Promise<void>((resolve) => {
        if (socket.connected) {
          resolve();
        } else {
          socket.once('connect', () => resolve());
        }
      });
      
      try {
        await Promise.race([
          waitForConnection,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (err) {
        setIsCreating(false);
        setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        return;
      }
    }
    
    socket.emit('createRoom', { name: name.trim() }, (response) => {
      if (response.success && response.code) {
        // Player bilgisini localStorage'a kaydet
        localStorage.setItem('playerName', name.trim());
        localStorage.setItem('pendingRoom', response.code);
        
        // Biraz bekle ki socket event'leri hazır olsun
        setTimeout(() => {
          router.push(`/room/${response.code}`);
          setIsCreating(false);
        }, 100);
      } else {
        setIsCreating(false);
        setError(response.error || 'Oda oluşturulamadı');
      }
    });
  };

  const handleJoinRoom = async () => {
    if (name.trim().length < 2) {
      setError('İsim en az 2 karakter olmalı');
      return;
    }

    if (roomCode.trim().length !== 6) {
      setError('Oda kodu 6 karakter olmalı');
      return;
    }

    setError('');
    setIsJoining(true);

    const socket = getSocket();
    
    // Socket bağlantısını bekle
    if (!socket.connected) {
      const waitForConnection = new Promise<void>((resolve) => {
        if (socket.connected) {
          resolve();
        } else {
          socket.once('connect', () => resolve());
        }
      });
      
      try {
        await Promise.race([
          waitForConnection,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (err) {
        setIsJoining(false);
        setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        return;
      }
    }
    
    socket.emit('joinRoom', { 
      code: roomCode.trim().toUpperCase(), 
      name: name.trim() 
    }, (response) => {
      if (response.success) {
        // Player bilgisini localStorage'a kaydet
        localStorage.setItem('playerName', name.trim());
        localStorage.setItem('pendingRoom', roomCode.trim().toUpperCase());
        
        // Biraz bekle ki socket event'leri hazır olsun
        setTimeout(() => {
          router.push(`/room/${roomCode.trim().toUpperCase()}`);
          setIsJoining(false);
        }, 100);
      } else {
        setIsJoining(false);
        setError(response.error || 'Odaya katılınamadı');
      }
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-hsd-dark via-hsd-primary to-red-900 flex items-center justify-center p-4">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
          isConnected ? 'bg-green-500' : 'bg-hsd-accent'
        } text-white`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-white' : 'bg-white animate-pulse'
          }`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Bağlandı' : 'Bağlanıyor...'}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-2xl">
              <h1 className="text-5xl font-black text-hsd-primary">HSD DEU</h1>
            </div>
          </div>
          <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
            Boşluğu Doldur
          </h2>
          <p className="text-red-100 text-lg">
            Kandır ve Kazan! 🎯
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-5">
          {/* Name Input */}
          <div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="İsminizi yazın"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-hsd-primary focus:bg-white transition-all text-lg text-gray-900 placeholder:text-gray-400"
              maxLength={20}
            />
          </div>

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || isJoining || !name.trim()}
            className="w-full bg-gradient-to-r from-hsd-primary to-red-700 text-white font-bold py-4 text-xl rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isCreating ? '⏳ Oluşturuluyor...' : '🎮 Yeni Oyun Başlat'}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-medium">
                Arkadaşının odasına katıl
              </span>
            </div>
          </div>

          {/* Room Code Input */}
          <div>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ODA KODU"
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-hsd-accent focus:bg-white transition-all uppercase text-center tracking-widest font-bold text-xl text-gray-900 placeholder:text-gray-300"
              maxLength={6}
            />
          </div>

          {/* Join Room Button */}
          <button
            onClick={handleJoinRoom}
            disabled={isCreating || isJoining || !name.trim() || roomCode.length !== 6}
            className="w-full bg-gradient-to-r from-hsd-accent to-orange-600 text-white font-bold py-4 text-xl rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isJoining ? '⏳ Katılınıyor...' : '🚪 Odaya Katıl'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-red-700 text-center text-sm font-medium">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white/90">
            <p className="font-semibold mb-2">Nasıl Oynanır?</p>
            <div className="space-y-1 text-sm text-white/80">
              <p>✍️ Yalan cevap yaz</p>
              <p>🎭 Diğerlerini kandır</p>
              <p>🏆 En çok puanı topla!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
