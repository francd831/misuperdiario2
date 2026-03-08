import { useEffect } from "react";
import { usePack } from "@/core/packs/PackContext";
import { ambientEngine } from "@/core/media/ambient/ambientEngine";

const AMBIENT_KEY = "vd_ambient_enabled";
const AMBIENT_VOL_KEY = "vd_ambient_volume";

/**
 * Auto-manages ambient sound: starts on first user interaction if enabled,
 * switches soundscape when pack changes.
 */
export function useAmbientSound() {
  const { activePack } = usePack();

  useEffect(() => {
    const enabled = localStorage.getItem(AMBIENT_KEY) === "1";
    if (!enabled || !activePack) return;

    const vol = parseInt(localStorage.getItem(AMBIENT_VOL_KEY) || "60", 10);

    // AudioContext requires user gesture, so start on first interaction
    const start = () => {
      ambientEngine.start(activePack.id);
      ambientEngine.setVolume(vol / 100);
      document.removeEventListener("pointerdown", start);
    };

    if (ambientEngine.isEnabled()) {
      // Already running, just switch pack
      ambientEngine.switchPack(activePack.id);
    } else {
      document.addEventListener("pointerdown", start, { once: true });
    }

    return () => document.removeEventListener("pointerdown", start);
  }, [activePack?.id]);

  // Switch pack when it changes and engine is already running
  useEffect(() => {
    if (activePack && ambientEngine.isEnabled()) {
      ambientEngine.switchPack(activePack.id);
    }
  }, [activePack?.id]);
}
