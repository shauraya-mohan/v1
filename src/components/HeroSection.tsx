import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import itcLogo from "@/assets/itc.jpg";
import mobifyLogo from "@/assets/mobifly.jpeg";
import uwaterlooLogo from "@/assets/uwaterloo.png";
import windscribeLogo from "@/assets/windlogo.png";

const experiences = [
  { company: "Windscribe", logo: windscribeLogo, role: "AI Support Engineer", status: "Incoming" },
  { company: "Mobifly", logo: mobifyLogo, role: "Technical Intern" },
  { company: "ITC", logo: itcLogo, role: "Logistics and Tech Intern" },
];

const education = [
  { institution: "UWaterloo", logo: uwaterlooLogo, program: "CS" },
];

const TypewriterName = () => {
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<'typing-english' | 'waiting' | 'deleting' | 'typing-hindi'>('typing-english');
  const [showCursor, setShowCursor] = useState(true);

  const englishName = "Shauraya Mohan";
  const hindiName = "शौर्या मोहन";

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    switch (phase) {
      case 'typing-english':
        if (displayText.length < englishName.length) {
          timeout = setTimeout(() => {
            setDisplayText(englishName.substring(0, displayText.length + 1));
          }, 120);
        } else {
          timeout = setTimeout(() => setPhase('waiting'), 2000);
        }
        break;

      case 'waiting':
        timeout = setTimeout(() => setPhase('deleting'), 500);
        break;

      case 'deleting':
        if (displayText.length > 0) {
          timeout = setTimeout(() => {
            setDisplayText(displayText.substring(0, displayText.length - 1));
          }, 80);
        } else {
          timeout = setTimeout(() => setPhase('typing-hindi'), 300);
        }
        break;

      case 'typing-hindi':
        if (displayText.length < hindiName.length) {
          timeout = setTimeout(() => {
            setDisplayText(hindiName.substring(0, displayText.length + 1));
          }, 120);
        } else {
          timeout = setTimeout(() => {
            setDisplayText("");
            setPhase('typing-english');
          }, 2000);
        }
        break;
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase, englishName, hindiName]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <h1 className="text-4xl md:text-5xl font-light text-foreground min-h-[3.5rem] md:min-h-[4rem] font-mono">
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 font-thin`}>|</span>
    </h1>
  );
};

interface HeroSectionProps {
  onOpenChatbot?: () => void;
}

export const HeroSection = ({ onOpenChatbot }: HeroSectionProps) => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-20 md:py-32 max-w-4xl"
    >
      <div className="space-y-8">
        <TypewriterName />
        
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-foreground font-mono">•</span>
            <span className="text-foreground font-mono">Computer Science Student</span>
            <img 
              src={uwaterlooLogo} 
              alt="University of Waterloo" 
              className="w-6 h-6 rounded object-cover"
            />
            <a 
              href="https://uwaterloo.ca" 
              className="text-foreground hover:text-foreground/70 transition-colors relative group font-mono font-bold"
            >
              University of Waterloo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        </div>

        {/* Current Work */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-foreground font-mono">•</span>
            <span className="text-muted-foreground italic font-mono">currently building:</span>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="text-foreground font-mono">
              <a href="#projects" className="hover:text-foreground/70 transition-colors relative group font-mono font-bold">
                Muse Sketch Studio
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
              <span className="text-muted-foreground ml-2 font-mono">— AI fashion design pipeline (Replicate AI Hackathon winner)</span>
            </div>
            <div className="text-foreground font-mono">
              <a href="#projects" className="hover:text-foreground/70 transition-colors relative group font-mono font-bold">
                FitVision
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
              <span className="text-muted-foreground ml-2 font-mono">— real-time pose estimation with 94% accuracy</span>
            </div>
            <div className="text-foreground font-mono">
              <a href="#projects" className="hover:text-foreground/70 transition-colors relative group font-mono font-bold">
                Stock Alert System
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
              <span className="text-muted-foreground ml-2 font-mono">— modular inventory monitoring with real-time alerts</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-foreground font-mono">•</span>
            <span className="text-muted-foreground italic font-mono">experience:</span>
          </div>
          
          <div className="space-y-3 ml-6">
            <div className="flex items-center space-x-3">
              <span className="text-foreground font-mono">AI Support Engineer</span>
              <span className="text-muted-foreground font-mono">@</span>
              <img 
                src={windscribeLogo} 
                alt="Windscribe" 
                className="w-5 h-5 rounded object-cover"
              />
              <a 
                href="https://windscribe.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/70 transition-colors relative group font-mono font-bold"
              >
                Windscribe
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
              <span className="text-xs text-accent font-mono">(Incoming)</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-foreground font-mono">Technical Intern</span>
              <span className="text-muted-foreground font-mono">@</span>
              <img 
                src={mobifyLogo} 
                alt="Mobifly" 
                className="w-5 h-5 rounded object-cover"
              />
              <a 
                href="#" 
                className="text-foreground hover:text-foreground/70 transition-colors relative group font-mono font-bold"
              >
                Mobifly
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-foreground font-mono">Logistics & Tech Intern</span>
              <span className="text-muted-foreground font-mono">@</span>
              <img 
                src={itcLogo} 
                alt="ITC" 
                className="w-5 h-5 rounded object-cover"
              />
              <a 
                href="#" 
                className="text-foreground hover:text-foreground/70 transition-colors relative group font-mono font-bold"
              >
                ITC
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>

        {/* Brief intro */}
        <div className="text-muted-foreground max-w-2xl leading-relaxed font-mono">
          Building innovative software solutions with expertise in full-stack development, 
          AI/ML, and system optimization. Passionate about creating impactful applications 
          that solve real-world problems.
        </div>

        {/* Chatbot CTA */}
        {onOpenChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-8"
          >
            <Button
              onClick={onOpenChatbot}
              variant="outline"
              className="group border-border/50 bg-background/50 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 font-mono"
            >
              <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Ask me anything
              <span className="ml-2 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};