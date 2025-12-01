import { motion } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import museSketchStudioDemo from "@/assets/demo copy.gif";
import makhanaImage from "@/assets/makhana-preview.jpg";
import aiStudyBuddyImage from "@/assets/ai-study-buddy-preview.jpg";

const projects = [
  {
    id: 1,
    title: "Muse Sketch Studio",
    description: "AI-powered fashion design pipeline that won the Replicate AI Hackathon. Converts text prompts into professional fashion sketches, colored illustrations, model photos, and runway videos using Gemini nano-banana and veo-3 models.",
    image: museSketchStudioDemo,
    tech: ["React", "TypeScript", "Node.js", "Replicate API", "Gemini", "Veo-3"],
    link: "https://github.com/shauraya-mohan/muse-sketch-studio"
  },
  {
    id: 2,
    title: "FitVision",
    description: "Real-time fitness web app with pose estimation using TensorFlow.js PoseNet model. Features custom exercise tracking, human pose estimation, and user-triggered model retraining with 94% classification accuracy.",
    image: makhanaImage,
    tech: ["React", "TensorFlow.js", "Material-UI", "PoseNet", "Computer Vision"],
    link: "https://github.com/shauraya-mohan/FitVision"
  },
  {
    id: 3,
    title: "Stock Alert System",
    description: "Modular stock alert application with real-time inventory monitoring, configurable alert thresholds, and record management. Features CRUD operations with transactional support and advanced search capabilities.",
    image: aiStudyBuddyImage,
    tech: ["Java", "SQL", "NetBeans", "Maven", "JDBC", "Swing"],
    link: "https://github.com/shauraya-mohan"
  }
];

export const ProjectsSection = () => {

  return (
    <motion.section
      id="projects"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="py-20"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-8 font-mono">Projects</h2>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <ProjectCard {...project} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};