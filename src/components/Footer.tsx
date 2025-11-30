import { useState } from "react";
import { Github, Linkedin, Phone, Mail, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("s35mohan@uwaterloo.ca");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <footer className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-center gap-6"
        >
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/shauraya-mohan"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/shauraya-mohan/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="tel:+12269897032"
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Phone"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              onClick={copyEmail}
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Copy email address"
            >
              <Mail className="h-5 w-5" />
              {emailCopied ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Shauraya Mohan. All rights reserved.
          </div>
        </motion.div>

        {/* Toast for email copied */}
        {emailCopied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium font-mono"
          >
            Email copied to clipboard!
          </motion.div>
        )}
      </div>
    </footer>
  );
};