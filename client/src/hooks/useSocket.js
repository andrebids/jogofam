import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Em produção, usar o mesmo host/porta da página atual
// Em desenvolvimento, usar localhost:3000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.PROD 
    ? `${window.location.protocol}//${window.location.host}` 
    : 'http://localhost:3000');

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    // Criar conexão
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts
    });

    socketInstance.on('connect', () => {
      console.log('Socket conectado');
      setConnected(true);
      reconnectAttempts.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket desconectado');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Erro de conexão:', error);
      setConnected(false);
      
      // Tentar reconectar com exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          socketInstance.connect();
        }, delay);
      }
    });

    setSocket(socketInstance);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket não conectado, evento não enviado:', event);
    }
  };

  return { socket, connected, emit };
}

