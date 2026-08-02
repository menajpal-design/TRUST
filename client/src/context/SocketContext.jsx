import React, { createContext, useContext, useState } from 'react';

const SocketContext = createContext(null);

// NOTE: Vercel Serverless does NOT support persistent WebSocket/Socket.io connections.
// Socket.io is intentionally disabled to prevent 404 polling errors on Vercel deployment.
// Real-time features can be enabled via a dedicated WebSocket server or Pusher/Ably if needed.

export const SocketProvider = ({ children }) => {
  const [onlineUsers] = useState([]);

  return (
    <SocketContext.Provider value={{ socket: null, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
