import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Mic, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecordSelector() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">¿Qué quieres grabar?</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate("/record/video")}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">Grabar vídeo</p>
              <p className="text-sm text-muted-foreground">Usa la cámara y el micrófono</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate("/record/audio")}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Mic className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold">Grabar voz</p>
              <p className="text-sm text-muted-foreground">Solo audio, sin cámara</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
