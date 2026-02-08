'use client';

import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    // Sunucu URL'ini otomatik belirle
    const socketUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : 'http://localhost:3000';
    
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
