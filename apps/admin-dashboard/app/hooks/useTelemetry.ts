'use client';

import { useEffect, useRef, useState } from 'react';
import { type Socket, io } from 'socket.io-client';

export type TelemetryData = {
  timestamp: string;
  websocketClients: number;
  database: {
    latencyMs: number;
    healthy: boolean;
    connections: number;
  };
  queue: {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
  };
};

/**
 * Real-time telemetry hook. Connects to the NestJS WebSocket gateway
 * and receives live telemetry data every 5 seconds.
 */
export function useTelemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
    const socket = io(`${backendUrl}/command-center`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2_000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('request:telemetry');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('telemetry:update', (payload: TelemetryData) => {
      setData(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { data, connected };
}
