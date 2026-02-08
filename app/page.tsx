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
    <main className="min-h-screen bg-gradient-to-br from-hsd-primary via-hsd-secondary to-hsd-dark flex items-center justify-center p-4">
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
            <div className="inline-block bg-white px-6 py-3 rounded-2xl shadow-xl">
              <h1 className="text-4xl font-black text-hsd-primary">HSD</h1>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-2">
            Boşluğu Doldur
          </h2>
          <p className="text-hsd-light text-lg">
            Eğlenceli kelime oyunu
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              İsminiz
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınızı girin"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-hsd-secondary transition-colors"
              maxLength={20}
            />
          </div>

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || isJoining}
            className="w-full bg-gradient-to-r from-hsd-primary to-hsd-secondary text-white font-semibold py-4 rounded-xl hover:from-hsd-secondary hover:to-hsd-primary transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isCreating ? 'Oluşturuluyor...' : 'Yeni Oda Oluştur'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                veya
              </span>
            </div>
          </div>

          {/* Room Code Input */}
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Oda Kodu
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="6 haneli kod"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-hsd-accent transition-colors uppercase text-center tracking-wider font-semibold text-xl"
              maxLength={6}
            />
          </div>

          {/* Join Room Button */}
          <button
            onClick={handleJoinRoom}
            disabled={isCreating || isJoining}
            className="w-full bg-gradient-to-r from-hsd-accent to-orange-600 text-white font-semibold py-4 rounded-xl hover:from-orange-600 hover:to-hsd-accent transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isJoining ? 'Katılınıyor...' : 'Odaya Katıl'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white text-sm opacity-90">
          <p>En az 2 oyuncu ile oynanır</p>
          <p className="mt-1">Her oyun 10 turdan oluşur</p>
          <p className="mt-3 text-xs opacity-75">© HSD Network</p>
        </div>
      </div>
    </main>
  );
}
