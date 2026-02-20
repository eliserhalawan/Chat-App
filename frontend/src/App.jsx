import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server! ID:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-2xl">
        {connected ? '✅ Connected to server!' : '❌ Not connected'}
      </div>
    </div>
  );
}

    