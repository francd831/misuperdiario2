import { Minus, MoveDown, MoveLeft, MoveRight, MoveUp, Plus, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

interface OverlayControlsProps {
  label: string;
  onMove: (deltaX: number, deltaY: number) => void;
  onRotate: (delta: number) => void;
  onScale: (delta: number) => void;
  onRemove: () => void;
}

const buttonStyle = {
  width: 34,
  height: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: "2px solid rgba(255,255,255,0.9)",
  background: "rgba(31, 41, 55, 0.78)",
  color: "white",
  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
} satisfies CSSProperties;

export function OverlayControls({ label, onMove, onRotate, onScale, onRemove }: OverlayControlsProps) {
  return (
    <div
      aria-label={label}
      style={{
        position: "absolute",
        left: "50%",
        bottom: -48,
        transform: "translateX(-50%)",
        zIndex: 300,
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "max-content",
        maxWidth: 260,
      }}
    >
      <button style={buttonStyle} type="button" aria-label="Mover izquierda" onClick={() => onMove(-5, 0)}>
        <MoveLeft size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Mover arriba" onClick={() => onMove(0, -5)}>
        <MoveUp size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Mover abajo" onClick={() => onMove(0, 5)}>
        <MoveDown size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Mover derecha" onClick={() => onMove(5, 0)}>
        <MoveRight size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Reducir" onClick={() => onScale(-0.1)}>
        <Minus size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Aumentar" onClick={() => onScale(0.1)}>
        <Plus size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Girar izquierda" onClick={() => onRotate(-15)}>
        <RotateCcw size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Girar derecha" onClick={() => onRotate(15)}>
        <RotateCw size={17} />
      </button>
      <button style={buttonStyle} type="button" aria-label="Eliminar" onClick={onRemove}>
        <Trash2 size={17} />
      </button>
    </div>
  );
}
