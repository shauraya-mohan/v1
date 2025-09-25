import { cn } from "@/lib/utils";

interface UnderlineLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const UnderlineLink = ({ href, children, className, external = false }: UnderlineLinkProps) => {
  const isExternal = external || href.startsWith('http');
  
  return (
    <a
      href={href}
      className={cn("underline-animate", className)}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
};