import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';
import bot from './assets/bot.png';

function RootLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen relative">
        <Outlet />
        {/* Bot Icon */}
        <div
          onClick={toggleChat}
          className="fixed bottom-10 right-10 z-50 border bg-gray-300 border-gray-300 p-2 rounded-full cursor-pointer hover:bg-gray-400 hover:border-gray-400"
        >
          <img src={bot} alt="bot" className="w-12 h-12" />
        </div>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-10 z-50 bg-white w-80 max-h-96 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-red-600 text-white text-center py-2">
              <h2 className="text-lg font-semibold">Medical Chatbot</h2>
            </div>
            <div
              id="chat-box"
              className="h-64 p-4 overflow-y-auto space-y-3 flex flex-col"
            ></div>
            <div className="flex items-center p-3 border-t">
              <input
                type="text"
                id="user-input"
                placeholder="Ask me something..."
                className="flex-1 px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-red-500"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Chat message handling
async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const message = userInput.value.trim();

  if (!message) return;

  // Append user message
  chatBox.innerHTML += `
    <div class="self-end bg-red-600 text-white px-4 py-2 rounded-lg w-max max-w-xs animate-fadeIn break-words">
      ${message}
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
  userInput.value = '';

  try {
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    const botResponse = data.response || "Sorry, I couldn't understand.";

    // Append bot response
    chatBox.innerHTML += `
      <div class="self-start bg-red-100 text-red-600 px-4 py-2 rounded-lg w-max max-w-xs animate-fadeIn break-words">
        ${botResponse}
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML += `
      <div class="self-start bg-red-100 text-red-600 px-4 py-2 rounded-lg w-max max-w-xs animate-fadeIn break-words">
        Network error. Please try again.
      </div>`;
  }
}

export default RootLayout;
