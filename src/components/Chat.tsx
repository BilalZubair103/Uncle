import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'motion/react';
import { Send, BookOpen, Coffee, Lightbulb, User, Compass } from 'lucide-react';
import { sendMessageStream } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastInquiry = messages.length > 0 && messages[messages.length - 1].role === 'user' 
    ? messages[messages.length - 1].content 
    : messages.findLast(m => m.role === 'user')?.content || "None at present";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      let fullResponse = '';
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of sendMessageStream(userMessage, history)) {
        fullResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: "I'm terribly sorry, dear fellow, but my connection seems a bit frayed at the moment. Let's try that again, shall we?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar - Artistic Flair */}
      <aside className="hidden lg:flex w-72 border-r border-border-inner flex-col p-8 bg-sidebar">
        <div className="mb-12">
          <h1 className="font-serif italic text-3xl text-accent-uncle leading-tight">
            The Uncle <br />
            <span className="text-xl text-stone-light not-italic font-sans tracking-widest uppercase">Chronicle</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-muted mb-4 font-bold">Current Inquiry</p>
            <p className="font-serif text-lg leading-snug text-ink italic">
              {lastInquiry.length > 60 ? lastInquiry.substring(0, 60) + "..." : lastInquiry}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-muted font-bold">Library Access</p>
            <ul className="space-y-3 text-sm font-medium text-stone-light">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-uncle"></span> 
                Theoretical Physics
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-muted"></span> 
                Classical History
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-muted"></span> 
                Advanced Algorithms
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-auto p-4 border border-border-inner rounded-xl bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-stone-muted mb-1 font-bold">Uncle's Presence</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-serif italic text-ink">Reflecting in the Study</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-border-outer">
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-stone-muted font-medium">
            Entry #{(4821 + messages.length).toLocaleString()} &nbsp; // &nbsp; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex gap-4 md:gap-6">
            <button className="text-[10px] uppercase tracking-widest border-b border-ink pb-1 font-bold hover:text-accent-uncle transition-colors">Archive</button>
            <button className="text-[10px] uppercase tracking-widest text-stone-muted font-bold hover:text-ink transition-colors">Reflections</button>
          </div>
        </header>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-12 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl"
              >
                <p className="font-serif text-4xl mb-6 italic text-ink">"Welcome into my study, sit down, get comfortable. What's on your mind today?"</p>
                <div className="markdown-body">
                  <p>
                    Whether you're curious about the mechanics of the universe, the nuances of philosophy, or just need a bit of guidance on a complex coding problem—I'm here to explore it with you.
                  </p>
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl"
                >
                  {message.role === 'user' ? (
                    <div className="flex flex-col space-y-2 mb-4">
                      <span className="text-[10px] uppercase tracking-widest text-stone-muted font-bold">Investigator</span>
                      <p className="font-serif text-2xl italic text-ink leading-relaxed">
                        "{message.content}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-accent-uncle font-bold">Uncle</span>
                        <div className="h-px flex-1 bg-border-inner opacity-40" />
                      </div>
                      <div className="markdown-body">
                        {message.content === '' ? (
                          <div className="flex gap-1 items-center h-8">
                            <span className="w-1.5 h-1.5 bg-accent-uncle/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-accent-uncle/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-accent-uncle/40 rounded-full animate-bounce" />
                          </div>
                        ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Input Area */}
        <footer className="h-32 px-6 md:px-12 py-6 bg-sidebar border-t border-border-outer flex items-center gap-6">
          <form 
            onSubmit={handleSubmit}
            className="flex-1 flex"
          >
            <div className="flex-1 bg-white border border-border-inner rounded-full px-6 py-4 flex items-center justify-between shadow-inner group focus-within:ring-2 focus-within:ring-accent-uncle/10 transition-all">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pose a question on art, science, or the soul..."
                className="flex-1 bg-transparent border-none outline-none text-ink italic font-serif text-lg placeholder:text-stone-muted"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-accent-uncle flex items-center justify-center text-parchment hover:bg-ink disabled:opacity-30 transition-all shadow-md ml-4 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="hidden md:block text-center min-w-24">
            <p className="text-[10px] uppercase tracking-widest text-stone-muted mb-1 font-bold">Uncle's Mood</p>
            <p className="text-xs font-serif italic text-ink">
              {isLoading ? 'Thinking Deeply' : 'Pensive & Warm'}
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
