import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { Chatbot } from "./Chatbot";

interface ChatbotWidgetProps {
  isExternalTrigger?: boolean;
}

export const ChatbotWidget = ({ isExternalTrigger = false }: ChatbotWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isExternalTrigger) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isExternalTrigger]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleExpandFromMinimized = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Minimized Widget */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-4 right-4 z-40"
          >
            <Button
              onClick={handleExpandFromMinimized}
              className="h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Interface */}
      <Chatbot 
        isOpen={isOpen} 
        onClose={handleClose}
        onMinimize={handleMinimize}
      />

      {/* Initial Chat Button - Only show when neither open nor minimized */}
      {!isOpen && !isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Button
            onClick={handleOpen}
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </Button>
        </motion.div>
      )}
    </>
  );
};
