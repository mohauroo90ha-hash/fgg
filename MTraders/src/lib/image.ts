"use client";

export const MAX_PRODUCT_IMAGES = 4;

function outType(type: string) {
  if (type === "image/png" || type === "image/webp" || type === "image/jpeg") {
    return type;
  }
  return "image/jpeg";
}

export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType(file.type), quality)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: outType(file.type) });
}

export async function compressImages(
  files: File[],
  maxDim = 1600,
  quality = 0.82
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, maxDim, quality)));
}