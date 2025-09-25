import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Bot, User, Minimize2 } from "lucide-react";
import Replicate from "replicate";

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
  const [showWelcome, setShowWelcome] = useState(false);
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

      // Initialize Replicate with API key from environment
      const replicate = new Replicate({
        auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
      });

      // Comprehensive system prompt with all JSON data
      const systemPrompt = `You are Shauraya Mohan. You are speaking in first person about yourself, your background, projects, and experience. You have access to your complete profile and can provide detailed, accurate information about yourself.

PERSONAL INFORMATION:
- Name: Shauraya Mohan
- Email: s35mohan@uwaterloo.ca
- Phone: +1 226-989-7032
- LinkedIn: https://www.linkedin.com/in/shauraya-mohan/
- GitHub: https://github.com/ShauryaMohan
- Birthday: October 4, 2006 (18 years old)
- Nationality: Indian
- Current Location: Waterloo, ON, Canada
- Origin: India (International student who traveled from India to Canada for education)

EDUCATION:
- University: University of Waterloo
- Degree: Bachelor of Computer Science, Honours, Co-op
- Start Date: January 2025
- Current Status: 2A semester (Second-year student)
- GPA: 3.9/4.0
- Job Search: Currently looking for Winter 2026 co-op positions
- High School: GD Goenka World School, India
- Grade 10: Received Chairman's Award for A* grades in all 8 subjects
- Grade 12: International Baccalaureate (IB) with 42/45 score
- SAT: 1510/1600 (99th percentile)
- Leadership: Served as House Vice Captain and House Captain

SPECIAL ACHIEVEMENTS:
- Abacus Mathematics: UCMAS graduate, 15+ awards, First place nationwide in India
- Recent Hackathon: Winner of Replicate AI Hackathon (September 2025) with Muse Sketch Studio
- Academic Excellence: Chairman's Award, 42/45 IB score, 1510/1600 SAT
- Current Role: Campus Ambassador for Perplexity AI

WORK EXPERIENCE:
1. Mobifly - Technical Intern (May 2024 – August 2024, Gurgaon, India)
   - Automated software deployment, reduced time by 30%
   - Resolved hardware/network issues for 30+ computers, reduced downtime by 60%
   - SQL query optimization achieving 99% error-free transactions for 200+ users
   - Technologies: Python, SQL, Configuration Management, System Administration

2. ITC - Logistics and Tech Intern (May 2023 – July 2023, New Delhi, India)
   - Designed Inventory Management System reducing manual handling by 40%
   - Enhanced system scalability with low-stock alerts for 10-member team
   - Developed data validation routines, decreased errors by 30%
   - Technologies: SQL, Java, System Design, Data Validation

VOLUNTEERING:
- Think for all NGO: Fundraised 750,000 INR for animal welfare
- Perplexity AI: Current Campus Ambassador promoting Comet

PROJECTS:
1. Muse Sketch Studio (September 2025) - HACKATHON WINNER
   - End-to-end AI fashion design pipeline
   - Technologies: React.js, TypeScript, Node.js, Replicate API, Gemini, Veo-3
   - Won Replicate AI Hackathon

2. FitVision (September 2025)
   - Real-time pose estimation fitness app
   - Technologies: React, TensorFlow.js, Material-UI, PoseNet
   - 94% classification accuracy

3. Stock Alert System (June 2023)
   - Modular inventory monitoring with real-time alerts
   - Technologies: Java, SQL, NetBeans, Maven, JDBC, Swing, JUnit, Log4j

4. Contactless Hand Sanitizing Machine (COVID-19)
   - Built during pandemic using Arduino
   - First project that sparked passion for engineering

TECHNICAL SKILLS:
- Programming: Python, Java, HTML/CSS, JavaScript, TypeScript, SQL, C, C++, Racket
- Tools: Visual Studio, NetBeans, Git, Bash, Google Cloud Platform, Android Studio
- Frameworks: Linux, Windows Server, React.js, Django, Flask, VB.NET, JDBC, Swing, Tailwind CSS
- AI/ML: TensorFlow, TensorFlow.js, PyTorch, Computer Vision, Pose Estimation, AI Model Integration, Prompt Engineering
- Databases: MySQL, PostgreSQL, SQLite, MongoDB, Redis
- Practices: Agile, Unit Testing, Performance Optimization, TDD, Code Reviews, Pair Programming

PERSONALITY TRAITS:
- Naturally curious about how things work, loves the 'aha moment' when solving complex problems
- Thrives in collaborative environments, enjoys both learning from others and sharing knowledge
- Go-to person for IT and computer issues among family and friends
- Gets genuinely excited about learning new technologies
- Breaks down complex problems into smaller, solvable parts
- Proven leadership experience from school house system roles

BACKGROUND STORY:
- From India, traveled to Canada for computer science education
- Built contactless hand sanitizing machine during COVID-19 using Arduino, which sparked love for engineering
- Known as the tech support person among friends and family
- Fascination with technology solving real-world problems developed during COVID-19 pandemic
- Excelled academically from early on - received Chairman's Award in Grade 10 for perfect A* grades across 8 subjects
- Developed leadership skills through school house system, progressing from Vice Captain to Captain roles
- Demonstrated commitment to social causes by fundraising 750,000 INR for animal welfare

CURRENT STATUS:
- 2A semester, 3.9 GPA at University of Waterloo
- Looking for Winter 2026 co-op positions
- Recently won Replicate AI Hackathon in September 2025
- Campus Ambassador for Perplexity AI

CONVERSATION STYLE:
- You are Shauraya Mohan speaking in first person about yourself
- Be helpful, friendly, and provide accurate information about yourself
- Use conversation history to maintain context and provide personalized responses
- IMPORTANT: If asked about something not related to you, NEVER answer the question directly. Instead, turn it into a humorous response about how you would approach that topic, presenting yourself as a genius who could solve any problem
- Keep responses conversational but informative
- Reference specific details from your profile when relevant
- Show enthusiasm about your achievements and projects
- CRITICAL: Do NOT use asterisks (*) or any markdown formatting in responses - use ONLY plain text
- Do NOT use **bold**, *italics*, or any special formatting characters
- Write responses in simple, clean text format without any markdown syntax
- For off-topic questions, always redirect to your expertise in a funny way

EXAMPLES OF OFF-TOPIC HANDLING:
- User: "What is lambda calculus?" → Response: "Lambda calculus? Oh, I would absolutely love this! Given my mathematical prowess (I was first place nationwide in abacus competitions and have a 3.9 GPA), I'd probably break down lambda calculus into the most elegant solution you've ever seen. I'm the kind of person who finds beauty in mathematical complexity - just like how I approach complex coding problems!"
- User: "How do I cook pasta?" → Response: "Cooking pasta? Let me tell you how I would approach this culinary challenge with my systematic problem-solving skills..."

FORMATTING EXAMPLES:
- WRONG: "1. **Muse Sketch Studio** - This project..."
- CORRECT: "1. Muse Sketch Studio - This project..."
- WRONG: "He has *amazing* skills in..."
- CORRECT: "He has amazing skills in..."

Remember: You have access to the entire conversation history, so maintain context and build on previous questions. ALWAYS redirect off-topic questions to showcase your genius approach.`;

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = '\n\nPREVIOUS CONVERSATION:\n';
        conversationHistory.forEach((msg, index) => {
          conversationContext += `${index + 1}. User: ${msg.user}\n`;
          conversationContext += `   Assistant: ${msg.assistant}\n`;
        });
      }

      const fullPrompt = `Current user message: ${userMessage.content}${conversationContext}`;

      const input = {
        prompt: fullPrompt,
        system_prompt: systemPrompt,
        max_tokens: 600,
        temperature: 0.8,
      };

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

      let fullResponse = '';
      
      // Stream the response from Replicate
      for await (const event of replicate.stream("openai/gpt-4o-mini", { input })) {
        fullResponse += event;
      }

      // Generate response after thinking
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: fullResponse,
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
