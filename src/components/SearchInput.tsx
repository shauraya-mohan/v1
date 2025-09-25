import { Search } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder = "Search...", className = "", ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={`search-focus w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-sm placeholder:text-muted-foreground ${className}`}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";