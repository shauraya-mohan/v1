import { useRef } from "react";
import { motion } from "framer-motion";
import { DotGridBackground } from "@/components/DotGridBackground";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

const Index = () => {

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <DotGridBackground />
      
      <Header onSearchFocus={() => {}} />
      
      <main className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <ProjectsSection />
          <ContactSection />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Index;
