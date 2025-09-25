import { ExternalLink } from "lucide-react";
import { BadgeRow } from "./BadgeRow";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  tech: string[];
  link: string;
}

export const ProjectCard = ({ title, description, image, tech, link }: ProjectCardProps) => {
  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-300">
      <div className="aspect-[16/10] bg-muted overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-muted rounded transition-colors ml-2"
            aria-label={`View ${title} project`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {description}
        </p>
        <BadgeRow badges={tech} />
      </div>
    </div>
  );
};