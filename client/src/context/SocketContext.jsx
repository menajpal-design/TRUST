import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const rawApiUrl = import.meta.env.VITE_API_URL || 'https://trust-server-lovat.vercel.app/api/v1';
      const socketServerUrl = import.meta.env.VITE_SOCKET_URL || rawApiUrl.replace(/\/api\/v1\/?$/, '');

      const socketInstance = io(socketServerUrl, {
        auth: { token: accessToken },
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        timeout: 10000
      });

      socketInstance.on('connect', () => {
        console.log('Socket Connected:', socketInstance.id);
      });

      socketInstance.on('connect_error', (err) => {
        // Silently handle socket connection warnings on serverless platforms
        console.warn('Socket connection note:', err.message);
      });


      socketInstance.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated, accessToken]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
