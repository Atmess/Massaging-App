import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

/**
 * SocketProvider creates a single Socket.io connection that is shared across the app.
 * It reuses the existing session cookie (`connect.sid`) via `withCredentials: true`
 * so the backend can authenticate the socket the same way it authenticates REST requests.
 */
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // No logged-in user -> make sure there is no open socket
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    const newSocket = io(SOCKET_BASE_URL, {
      withCredentials: true, // sends the connect.sid cookie for session auth
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('[socket.io] connected');
    });
    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('[socket.io] disconnected');
    });
    newSocket.on('connect_error', (err) => {
      console.error('[socket.io] connect error:', err.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [user, SOCKET_BASE_URL]);

  const joinChat = (chatId) => {
    if (socketRef.current) socketRef.current.emit('join', { chatId });
  };
  const leaveChat = (chatId) => {
    if (socketRef.current) socketRef.current.emit('leave', { chatId });
  };
  const sendMessage = (chatId, content, mediaUrl, cb) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { chatId, content, mediaUrl }, cb);
    } else if (cb) {
      cb({ ok: false, error: 'Socket not connected' });
    }
  };
  const typing = (chatId) => {
    if (socketRef.current) socketRef.current.emit('typing', { chatId });
  };
  const stopTyping = (chatId) => {
    if (socketRef.current) socketRef.current.emit('stopTyping', { chatId });
  };
  const on = (event, handler) => {
    if (socketRef.current) socketRef.current.on(event, handler);
  };
  const off = (event, handler) => {
    if (socketRef.current) socketRef.current.off(event, handler);
  };

  const value = {
    socket,
    connected,
    joinChat,
    leaveChat,
    sendMessage,
    typing,
    stopTyping,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx; // returns null if used outside provider; components handle null
};
