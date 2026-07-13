import type { EntryType } from "../diary/types";

const AUDIO_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
const VIDEO_MIME_TYPES = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

export function getSupportedRecordingMimeType(type: Extract<EntryType, "audio" | "video">) {
  const options = type === "audio" ? AUDIO_MIME_TYPES : VIDEO_MIME_TYPES;
  return options.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

export function getMediaConstraints(type: Extract<EntryType, "audio" | "video">, quality: "low" | "medium" | "high") {
  if (type === "audio") {
    return { audio: { echoCancellation: true, noiseSuppression: true }, video: false } satisfies MediaStreamConstraints;
  }

  const videoByQuality = {
    low: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
    medium: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    high: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
  };

  return {
    audio: { echoCancellation: true, noiseSuppression: true },
    video: {
      facingMode: "user",
      ...videoByQuality[quality],
    },
  } satisfies MediaStreamConstraints;
}
