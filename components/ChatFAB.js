"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User, Bot, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ChatFAB() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', content: 'bot.botWelcome' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    setMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setChatHistory([...newHistory, { 
        role: 'bot', 
        content: t('bot.simulatedResponse', 'I\'ve found 3 great options for "{{message}}" in your local stores! Would you like to see them?', { message })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white dark:bg-gray-900 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">{t('bot.botName', 'Jenny AI')}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">{t('bot.online', 'Online')}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl flex items-start gap-3 ${
                  chat.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-800'
                }`}>
                  <div className="shrink-0 mt-1">
                    {chat.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{t(chat.content)}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('bot.askAnything', 'Ask me anything...')}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-3.5 pl-6 pr-14 text-sm font-bold text-gray-800 dark:text-white outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Zap size={10} className="text-amber-500" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('bot.poweredBy', 'Powered by Jenny AI Core')}</p>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 active:scale-90 group relative ${
          isOpen ? 'bg-gray-900 rotate-90' : 'bg-emerald-600 shadow-emerald-600/30'
        }`}
      >
        {isOpen ? <X size={28} strokeWidth={3} /> : <MessageCircle size={28} strokeWidth={3} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
