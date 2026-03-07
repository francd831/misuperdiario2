import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mic, MicOff, Save } from "lucide-react";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { useProfile } from "@/core/auth/ProfileContext";
import type { ExtendedEntry } from "./types";

/** Check browser support for Web Speech API */
function getSpeechRecognition(): any {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function RecordText() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggleDictation = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        setBody((prev) => {
          const spacer = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
          return prev + spacer + finalTranscript;
        });
        finalTranscript = "";
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const save = async () => {
    if (!body.trim() && !title.trim()) return;

    const id = crypto.randomUUID();
    const entry: ExtendedEntry = {
      id,
      profileId: activeProfile?.id ?? "default",
      date: new Date().toISOString().slice(0, 10),
      type: "text",
      title: title || undefined,
      note: body,
      isLocked: isCapsule,
      unlockAt: isCapsule && unlockDate ? new Date(unlockDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await entryRepository.save(entry as any);
    navigate("/");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col gap-4 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Escribir entrada</h1>
      </div>

      {/* Title */}
      <Input
        placeholder="Título (opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Text body */}
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          placeholder="Escribe aquí o usa el dictado por voz…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[40vh] resize-none text-base"
        />

        {/* Dictation button */}
        {speechSupported && (
          <Button
            variant={listening ? "destructive" : "secondary"}
            size="icon"
            className="absolute bottom-3 right-3 h-12 w-12 rounded-full shadow-md"
            onClick={toggleDictation}
          >
            {listening ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {listening && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          🎤 Escuchando… habla ahora
        </p>
      )}

      {/* Time capsule */}
      <div className="flex items-center gap-3">
        <Switch checked={isCapsule} onCheckedChange={setIsCapsule} id="capsule" />
        <Label htmlFor="capsule">Guardar como cápsula del tiempo</Label>
      </div>
      {isCapsule && (
        <Input
          type="date"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
        />
      )}

      {/* Save */}
      <Button className="gap-2" onClick={save} disabled={!body.trim() && !title.trim()}>
        <Save className="h-4 w-4" /> Guardar
      </Button>
    </div>
  );
}
