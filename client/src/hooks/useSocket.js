import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Função para determinar a URL do socket
function getSocketUrl() {
  // Se VITE_SOCKET_URL estiver definido, usar ele
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // Em produção, usar o mesmo host/porta da página atual
  if (import.meta.env.PROD) {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Em desenvolvimento:
  const hostname = window.location.hostname;
  
  // Se acessado via IP da rede local, usar o mesmo IP mas porta 3000
  const isLocalIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
  if (isLocalIP) {
    return `http://${hostname}:3000`;
  }
  
  // Se acessado via localhost, usar caminho relativo para usar o proxy do Vite
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ''; // Caminho relativo usa o proxy do Vite
  }
  
  // Fallback: usar localhost:3000
  return 'http://localhost:3000';
}

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    const SOCKET_URL = getSocketUrl();
    
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

