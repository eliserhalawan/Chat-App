import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server! ID:', socket.id);
      setConnected(true);
    });

    // Listen for disconnection events and update the connection status
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Listen for incoming chat messages and store them in the state
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for user notifications (join/leave) and store them in the state
    socket.on('user notification', (notification) => {
      setMessages((prev)=> [...prev, { type: 'notification', text: notification }]);
    });

    return ()=> {
      socket.off("chat message");
      socket.off("user notification");
    };
  }, []);
  
  // Function to send a chat message to the server
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('chat message', { username, text: message });
      setMessage('');
    }
  };

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('user joined', username);
      setHasUsername(true);
    }
  };

  if(!hasUsername) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6'>
          <h1 className="text-2xl text-white font-bold mb-4">
            Join Chat
          </h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
            placeholder="Enter your username..."
            className="w-full flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white outline-none mb-4"
          />
          <button
            onClick={joinChat}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h1 className="text-2xl text-white font-bold mb-4">
          Chat App {connected ? '🟢': '🔴'}
          </h1>

          <div className="bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div key={index}>
                {msg.type === 'notification' ? (
                  <div className="text-gray-400 text-center text-sm mb-2 italic">
                    {msg.text}
                  </div>
                ) : (
              <div className="text-white mb-2 bg-gray-600 p-2 rounded">
                <span className='font-bold text-blue-400'>{msg.username}: </span> {msg.text}
              </div>
            )}
            </div>
          ))}
         </div> 

          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
              Send
            </button>
          </div>
      </div>
    </div>
  );
}

    