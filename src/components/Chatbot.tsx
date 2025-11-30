import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Bot, User, Minimize2 } from "lucide-react";

// Typewriter Message Component
const TypewriterMessage = ({ content, onComplete }: { content: string; onComplete?: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30 + Math.random() * 20); // Random delay between 30-50ms for natural feel

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  useEffect(() => {
    // Reset when content changes
    setDisplayedContent("");
    setCurrentIndex(0);
  }, [content]);

  return (
    <span>
      {displayedContent}
      {currentIndex < content.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const Chatbot = ({ isOpen, onClose, onMinimize }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Show welcome message with typewriter effect when chatbot opens
      if (messages.length === 0) {
        setTimeout(() => {
          const welcomeMessage: Message = {
            id: 'welcome',
            content: "Hi! I'm Shauraya. Ask me anything about my background, projects, or experience!",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }, 500);
      }
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Build conversation history (last 10 exchanges to avoid token limits)
      const conversationHistory = messages
        .filter(msg => msg.sender === 'bot' || msg.sender === 'user')
        .slice(-20) // Last 20 messages (10 exchanges)
        .reduce((acc, msg, index) => {
          if (msg.sender === 'user') {
            acc.push({
              user: msg.content,
              assistant: '' // Will be filled by the next bot message
            });
          } else if (msg.sender === 'bot' && acc.length > 0) {
            acc[acc.length - 1].assistant = msg.content;
          }
          return acc;
        }, [] as { user: string; assistant: string }[]);

      // Call the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsThinking(false);
      setIsTyping(true);
      
      // Add thinking message
      const thinkingMessage: Message = {
        id: `thinking-${Date.now()}`,
        content: "AI is thinking...",
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, thinkingMessage]);

      // Generate response after thinking
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        // Remove thinking message and add actual response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, botMessage];
        });
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);

    } catch (error) {
      console.error('Error calling Replicate API:', error);
      setIsThinking(false);
      setIsTyping(true);
      
      // Add thinking message
      const thinkingMessage: Message = {
        id: `thinking-${Date.now()}`,
        content: "AI is thinking...",
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, thinkingMessage]);

      // Show error message
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment!",
          sender: 'bot',
          timestamp: new Date()
        };
        
        // Remove thinking message and add error response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== thinkingMessage.id);
          return [...filtered, errorMessage];
        });
        setIsTyping(false);
      }, 1500);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 w-96 h-[600px] max-w-[calc(100vw-2rem)]"
        >
          <Card className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-mono font-semibold text-foreground">Chat with my AI version</h3>
                  <p className="text-xs text-muted-foreground font-mono">Shauraya</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMinimize}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-accent/20' 
                        : 'bg-muted'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3 text-accent" />
                      ) : (
                        <Bot className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className={`rounded-lg px-3 py-2 font-mono text-sm ${
                      message.sender === 'user'
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-muted/50 text-foreground border border-border/30'
                    }`}>
                      <p className="whitespace-pre-wrap">
                        {message.sender === 'bot' && !message.isTyping ? (
                          <TypewriterMessage 
                            content={message.content} 
                            onComplete={() => {
                              // Optional: Add completion callback if needed
                            }}
                          />
                        ) : (
                          message.content
                        )}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-3 h-3 text-muted-foreground animate-pulse" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted/50 text-foreground border border-border/30">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">AI is thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 font-mono text-sm bg-background/50 border-border/50 focus:border-accent/50"
                  disabled={isTyping || isThinking}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || isThinking}
                  size="icon"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Try asking: "Tell me about your projects" or "What's your experience?"
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
