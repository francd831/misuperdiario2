import { useRef, useCallback, type ReactNode } from "react";

interface Props {
  onLongPress: () => void;
  duration?: number;
  children: ReactNode;
  className?: string;
}

export function LongPress({ onLongPress, duration = 2500, children, className }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    timer.current = setTimeout(onLongPress, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  return (
    <div
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      className={className}
      style={{ userSelect: "none", touchAction: "none" }}
    >
      {children}
    </div>
  );
}
