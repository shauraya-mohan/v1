import { ThemeToggle } from "./ThemeToggle";
import { UnderlineLink } from "./UnderlineLink";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Name */}
          <div className="font-medium text-foreground font-mono">
            Shauraya Mohan
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-mono">
            <UnderlineLink href="#about">About</UnderlineLink>
            <UnderlineLink href="#projects">Projects</UnderlineLink>
            <UnderlineLink href="#contact">Contact</UnderlineLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};