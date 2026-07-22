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
      const socketInstance = io('/', {
        auth: { token: accessToken },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Socket Connected:', socketInstance.id);
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
