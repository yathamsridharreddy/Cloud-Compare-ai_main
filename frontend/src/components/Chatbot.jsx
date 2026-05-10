import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

export default function Chatbot({ type = 'cloud' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your ${type === 'cloud' ? 'Cloud' : 'AI Tools'} Assistant. Ask me anything about ${type === 'cloud' ? 'cloud providers, pricing, or architecture' : 'AI tools, comparisons, or recommendations'}!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const res = await api.chat(userMsg, type, history);
      
      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my brain. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown-like parser for basic bolding
  const parseMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-neon-blue">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl z-50 shadow-lg ${type === 'cloud' ? 'bg-neon-blue' : 'bg-neon-purple'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ boxShadow: isOpen ? 'none' : `0 0 20px ${type === 'cloud' ? 'rgba(0,210,255,0.4)' : 'rgba(138,43,226,0.4)'}` }}
      >
        {isOpen ? '✕' : (type === 'cloud' ? '☁️' : '🤖')}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] glass rounded-2xl flex flex-col z-50 border overflow-hidden ${type === 'cloud' ? 'border-neon-blue/30 glow-blue' : 'border-neon-purple/30 glow-purple'}`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center gap-3 ${type === 'cloud' ? 'border-neon-blue/20 bg-neon-blue/10' : 'border-neon-purple/20 bg-neon-purple/10'}`}>
              <div className="text-2xl">{type === 'cloud' ? '☁️' : '🤖'}</div>
              <div>
                <h3 className="font-bold text-white">{type === 'cloud' ? 'Cloud Assistant' : 'AI Tools Expert'}</h3>
                <p className="text-xs text-gray-400">Powered by Groq</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? (type === 'cloud' ? 'bg-neon-blue text-black rounded-br-sm' : 'bg-neon-purple text-white rounded-br-sm')
                        : 'bg-dark-800 border border-gray-700 text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : <div className="chat-markdown whitespace-pre-wrap">{parseMarkdown(msg.content)}</div>}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-dark-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-bl-sm text-sm">
                    <span className="typing-cursor">Thinking</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-800 bg-dark-900/50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="w-full input-dark py-3 pl-4 pr-12 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 top-2 p-1.5 rounded-lg text-white transition-colors ${type === 'cloud' ? 'hover:bg-neon-blue/20 text-neon-blue' : 'hover:bg-neon-purple/20 text-neon-purple'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
