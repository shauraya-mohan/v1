import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    // Check if public key is configured
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS public key not configured');
      setStatus('error');
      setIsLoading(false);
      setTimeout(() => setStatus('idle'), 8000);
      return;
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        to_name: 'Shauraya Mohan',
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => setStatus('idle'), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="py-20 flex justify-center"
    >
      <div className="max-w-2xl w-full">
        <div className="flex items-center space-x-3 mb-8">
          <Mail className="h-6 w-6 text-foreground" />
          <h2 className="text-3xl md:text-4xl font-bold font-mono">Get in touch</h2>
        </div>
        
        <p className="text-muted-foreground mb-8 leading-relaxed font-mono">
          Have a project in mind or want to collaborate? I'd love to hear from you. 
          Send me a message and I'll get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2 font-mono">
                Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full font-mono"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2 font-mono">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2 font-mono">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell me about your project or just say hello!"
              rows={6}
              className="w-full resize-none font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto flex items-center space-x-2 font-mono"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </>
            )}
          </Button>

          {/* Status Messages */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-mono">Message sent successfully! I'll get back to you soon.</span>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"
            >
              <AlertCircle className="h-5 w-5" />
              <div className="flex flex-col font-mono">
                <span>Failed to send message. EmailJS configuration needed.</span>
                <span className="text-sm mt-1">Please email me directly at s35mohan@uwaterloo.ca</span>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </motion.section>
  );
};
