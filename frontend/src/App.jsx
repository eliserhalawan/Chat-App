import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);

  const isImageUrl = (text) => {
    // Check if it looks like a URL
    if (!text.startsWith("http")) return false;

    // Check for image extensions (including gif)
    const hasImageExtension = /\.(jpeg|jpg|gif|png|webp|svg|apng)/i.test(text);

    // Check for known image hosting sites
    const imageHosts = [
      "unsplash.com",
      "imgur.com",
      "picsum.photos",
      "i.imgur.com",
      "giphy.com",
      "tenor.com",
      "media.giphy.com",
    ];
    const isImageHost = imageHosts.some((host) => text.includes(host));

    return hasImageExtension || isImageHost;
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server! ID:", socket.id);
      setConnected(true);
    });

    // Listen for disconnection events and update the connection status
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    // Listen for incoming chat messages and store them in the state
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for user notifications (join/leave) and store them in the state
    socket.on("user notification", (notification) => {
      setMessages((prev) => [
        ...prev,
        { type: "notification", text: notification },
      ]);
    });

    return () => {
      socket.off("chat message");
      socket.off("user notification");
    };
  }, []);

  // Function to send a chat message to the server
  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        username,
        text: message,
        isImage: isImageUrl(message),
        socketId: socket.id,
      };

      socket.emit("chat message", messageData);
      setMessage("");
    }
  };

  const joinChat = () => {
    if (username.trim()) {
      socket.emit("user joined", username);
      setHasUsername(true);
    }
  };

  // Scroll to the bottom of the chat messages when a new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!hasUsername) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h1 className="text-2xl text-gray font-bold mb-4">
              Welcome to Chat
            </h1>
            <p className="text-gray-600 mb-4">
              Please enter your username to join the chat
            </p>
          </div>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinChat()}
            placeholder="Enter your username..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition mb-4 text-gray-800"
          />
          <button
            onClick={joinChat}
            className="w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-150 flex flex-col overflow-hidden">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-white">chat</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Chat Room</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
                ></div>
                <span className="text-white text-sm">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 hide-scrollbar">
          {messages.map((msg, index) => {
            if (msg.type === "notification") {
              return (
                <div key={index} className="flex justify-center">
                  <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-gray-600 text-sm shadow-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isOwnMessage = msg.socketId === socket.id;

            return (
              <div
                key={index}
                className={`flex gap-3 items-start ${isOwnMessage ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar bubble*/}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold self-start ${
                    isOwnMessage ? "bg-purple-500" : "bg-blue-500"
                  }`}
                >
                  {msg.username.substring(0, 2).toUpperCase()}
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[70%] flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"}`}
                >
                  {!isOwnMessage ? (
                    <span className="text-xs font-medium text-gray-600 px-3">
                      {msg.username}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-600 px-3">
                      (You)
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isOwnMessage
                        ? "bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.isImage ? (
                      <img
                        src={msg.text}
                        alt="Shared image"
                        className="max-w-full max-h-64 rounded-lg object-cover"
                      />
                    ) : (
                      <p className="break-all whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-gray-800"
            />
            <button
              onClick={sendMessage}
              className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
