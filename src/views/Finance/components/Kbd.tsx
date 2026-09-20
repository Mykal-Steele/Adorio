interface KbdProps {
  children: React.ReactNode;
}

export default function Kbd({ children }: KbdProps) {
  return (
    <span className="font-paper-mono rounded-[5px] border border-[var(--paper-line)] bg-[var(--paper-cream)] px-1.5 py-0.5 text-[0.7rem] text-[var(--paper-muted-2)]">
      {children}
    </span>
  );
}
