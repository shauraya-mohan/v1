interface BadgeRowProps {
  badges: string[];
  className?: string;
}

export const BadgeRow = ({ badges, className = "" }: BadgeRowProps) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => (
        <span key={badge} className="tiny-badge">
          {badge}
        </span>
      ))}
    </div>
  );
};