interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-[18px] py-2.5 text-sm shadow-[2px_3px_0_var(--paper-ink)]">
      {message}
    </div>
  );
}
