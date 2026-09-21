interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const Spinner = ({ size = 'md', label, className = '' }: SpinnerProps) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-solid border-[var(--paper-accent-strong,#a8801a)] border-r-transparent ${sizes[size]}`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <p className="font-paper-mono text-[var(--paper-muted,#4a443c)]">{label}</p>}
    </div>
  );
};

export default Spinner;
