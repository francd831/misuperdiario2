import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMediaConstraints, getSupportedRecordingMimeType } from "./recording";

describe("recording helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (mimeType: string) => mimeType === "audio/webm" || mimeType === "video/webm",
    });
  });

  it("chooses a supported audio mime type", () => {
    expect(getSupportedRecordingMimeType("audio")).toBe("audio/webm");
  });

  it("builds video constraints from quality", () => {
    const constraints = getMediaConstraints("video", "low");
    expect(constraints.audio).toBeTruthy();
    expect(constraints.video).toMatchObject({
      facingMode: "user",
      width: { ideal: 640 },
    });
  });
});
