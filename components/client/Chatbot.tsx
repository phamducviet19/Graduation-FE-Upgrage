import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';
import api from '../../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickPrompts = [
  "Tư vấn dàn PC 15 triệu chơi mượt GTA V & Valorant",
  "Nên chọn RTX 4060 hay RX 7600?",
  "Core i5 13400F nên đi với Mainboard và RAM nào?",
  "Nguồn 650W có gánh nổi RTX 4070 không?"
];

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là **AI PC Assistant**. Tôi có thể giúp bạn chọn linh kiện, tối ưu ngân sách ráp PC hoặc giải đáp các thắc mắc về tương thích phần cứng!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post<any>('/chatbot/chat', { message: userMessage.text });
      const botResponseText = response.message || response.response || response.reply || (typeof response === 'string' ? response : "Tôi chưa hiểu rõ câu hỏi này, bạn có thể mô tả cụ thể hơn không?");

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Hiện tại máy chủ AI đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  // Helper function to format bot messages with basic Markdown
  const formatMessage = (text: string) => {
    const parseBold = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-neon-cyan">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    const lines = text.split('\n');
    const renderedContent: React.ReactNode[] = [];
    let currentListItems: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2);
        currentListItems.push(
          <li key={`li-${index}`} className="ml-4 list-disc marker:text-neon-cyan/70 text-slate-200">
            {parseBold(content)}
          </li>
        );
      } else {
        if (currentListItems.length > 0) {
          renderedContent.push(
            <ul key={`ul-${index}`} className="mb-2 pl-1 space-y-1">
              {currentListItems}
            </ul>
          );
          currentListItems = [];
        }

        if (trimmedLine === '') {
          renderedContent.push(<div key={`br-${index}`} className="h-2" />);
        } else {
          renderedContent.push(
            <p key={`p-${index}`} className="mb-1 leading-relaxed text-slate-200">
              {parseBold(line)}
            </p>
          );
        }
      }
    });

    if (currentListItems.length > 0) {
      renderedContent.push(
        <ul key="ul-end" className="mb-2 pl-1 space-y-1">
          {currentListItems}
        </ul>
      );
    }

    return <div>{renderedContent}</div>;
  };

  return (
    <>
      {/* Floating Toggle Button with Glowing Pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
          isOpen 
            ? 'bg-rose-500 text-white rotate-90 shadow-rose-500/50' 
            : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-dark-base shadow-[0_0_25px_rgba(0,240,255,0.6)] border border-neon-cyan/60'
        }`}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={26} /> : (
          <div className="relative">
            <Bot size={26} className="text-dark-base stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shadow-neon-cyan">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white tracking-wide">PC AI COPILOT</h3>
                  <span className="text-[10px] bg-cyan-500/20 text-neon-cyan border border-neon-cyan/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    v2.5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-neon-emerald rounded-full animate-pulse"></span>
                  Sẵn sàng tư vấn cấu hình
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-neon-cyan flex-shrink-0 mt-1">
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-dark-base font-medium rounded-br-none shadow-neon-cyan'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'bot' ? formatMessage(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                  
                  <span className={`text-[10px] mt-1.5 block opacity-60 font-mono ${msg.sender === 'user' ? 'text-right text-dark-base' : 'text-left text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-neon-cyan">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length < 4 && (
            <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800/80">
              <p className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                <Zap size={12} className="text-yellow-400" /> Gợi ý câu hỏi nhanh:
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="whitespace-nowrap text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-neon-cyan border border-slate-700/60 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về cấu hình, game, linh kiện..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-neon-cyan text-dark-base p-2.5 rounded-xl hover:bg-highlight disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all shadow-neon-cyan flex items-center justify-center flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
};

export default Chatbot;