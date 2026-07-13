export async function blobFromCanvas(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.84) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen."));
    }, type, quality);
  });
}

export async function createImageThumbnail(source: Blob, maxSize = 420) {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas no disponible.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return blobFromCanvas(canvas, "image/jpeg", 0.72);
}
