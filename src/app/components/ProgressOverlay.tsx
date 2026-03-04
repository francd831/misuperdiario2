import { Progress } from "@/components/ui/progress";

interface Props {
  visible: boolean;
  label?: string;
  value?: number;
}

export function ProgressOverlay({ visible, label = "Procesando…", value }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <p className="text-lg font-medium text-foreground">{label}</p>
      {value != null ? (
        <Progress value={value} className="w-64" />
      ) : (
        <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
