import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type MemoryDrawerProps = {
  open: boolean;
  title: string;
  eyebrow: string;
  children: ReactNode;
  onClose: () => void;
};

export function MemoryDrawer({ open, title, eyebrow, children, onClose }: MemoryDrawerProps) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="memory-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="memory-drawer" role="dialog" aria-modal="true" aria-labelledby="memory-drawer-title">
        <div className="memory-drawer__handle" aria-hidden="true" />
        <header className="memory-drawer__header">
          <div><span>{eyebrow}</span><h2 id="memory-drawer-title">{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar y volver"><X size={20} /></button>
        </header>
        <div className="memory-drawer__content">{children}</div>
      </section>
    </div>
  );
}
