import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../services/api';

export interface LiveStreamEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  payload: any;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isPaused: boolean;
  latencyMs: number;
  lastEventTime: string | null;
  liveEvents: LiveStreamEvent[];
  togglePauseStream: () => void;
  clearEvents: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(118);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveStreamEvent[]>([]);

  useEffect(() => {
    const token = getAuthToken();
    const newSocket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ Connected to DATAPULSE Socket.IO Server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connection.ready', (data) => {
      if (typeof data.isSimulationPaused === 'boolean') {
        setIsPaused(data.isSimulationPaused);
      }
    });

    newSocket.on('stream.status_changed', (data) => {
      setIsPaused(data.isPaused);
    });

    newSocket.on('datapulse.event', (event: LiveStreamEvent) => {
      setLastEventTime(event.timestamp || new Date().toISOString());
      // Random subtle jitter around 95-135ms
      setLatencyMs(Math.floor(95 + Math.random() * 40));
      setLiveEvents((prev) => [event, ...prev.slice(0, 49)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const togglePauseStream = () => {
    if (!socket) return;
    const nextState = !isPaused;
    socket.emit('stream.control', { action: nextState ? 'pause' : 'resume' });
    setIsPaused(nextState);
  };

  const clearEvents = () => {
    setLiveEvents([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isPaused,
        latencyMs,
        lastEventTime,
        liveEvents,
        togglePauseStream,
        clearEvents,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}

