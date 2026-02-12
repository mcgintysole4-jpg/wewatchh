import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { Send } from 'lucide-react';
import { Input } from './Input';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: User;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.userId === currentUser.id;
          if (msg.isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-2">
                 <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                   {msg.text}
                 </span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-xs font-medium ${isMe ? 'text-brand-400' : 'text-gray-400'}`}>
                  {msg.userName}
                </span>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm break-words ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 bg-gray-800/80 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
