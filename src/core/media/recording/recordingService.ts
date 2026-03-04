/**
 * Recording service stub - handles camera capture for diary entries.
 * Will be expanded with actual MediaRecorder API usage.
 */
export const recordingService = {
  async capturePhoto(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoElement, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to capture"))),
        "image/jpeg",
        0.9
      );
    });
  },

  async requestCamera(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  },

  stopCamera(stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
  },
};
