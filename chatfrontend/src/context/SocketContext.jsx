import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create a SocketContext
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username'); // Retrieve username for room joining

    if (token) {
      const newSocket = io('http://192.168.65.7:3000', {
        withCredentials: true,
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');

        if (username) {
          newSocket.emit('joinRoom', username); // Automatically join room
          console.log(`Joined room: ${username}`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
