import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface DebouncedPostalInputProps {
  value: string;
  onChange: (value: string) => void;
  onDebounced?: (value: string, isStable: boolean) => void;
  placeholder?: string;
  debounceMs?: number;
  label: string;
  id: string;
  error?: string;
  suggestions?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

export default function DebouncedPostalInput({
  value,
  onChange,
  onDebounced,
  placeholder = '12345-678',
  debounceMs = 600,
  label,
  id,
  error,
  suggestions = [],
  disabled = false,
}: DebouncedPostalInputProps) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length > 0) {
      setIsWaiting(true);
      timeoutRef.current = setTimeout(() => {
        setIsWaiting(false);
        onDebounced?.(value, true);
      }, debounceMs);
    } else {
      setIsWaiting(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounceMs, onDebounced]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          if (activeSuggestionIndex >= 0) {
            e.preventDefault();
            onChange(suggestions[activeSuggestionIndex].value);
            setActiveSuggestionIndex(-1);
          }
          break;
        case 'Escape':
          setActiveSuggestionIndex(-1);
          break;
      }
    },
    [suggestions, activeSuggestionIndex, onChange]
  );

  return (
    <div className="relative">
      <Label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-autocomplete={suggestions.length > 0 ? 'list' : 'none'}
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `${id}-suggestion-${activeSuggestionIndex}`
              : undefined
          }
          className={error ? 'border-destructive' : ''}
        />
        {isWaiting && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`${id}-suggestion-${index}`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                index === activeSuggestionIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => {
                onChange(suggestion.value);
                setActiveSuggestionIndex(-1);
              }}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
