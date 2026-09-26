import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
]);

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "products");

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = path.extname(file.name || "").toLowerCase() || ".png";
  if (!ALLOWED.has(ext)) throw new Error(`Unsupported file type: ${ext}`);
  if (file.size > 4 * 1024 * 1024) throw new Error("Image must be under 4MB");

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;

  // On Vercel (or anywhere BLOB_READ_WRITE_TOKEN is set) store in Vercel Blob.
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, bytes, {
      access: "public",
      token: blobToken,
    });
    return blob.url;
  }

  // Local dev: save into /public so images are served by Next.js.
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, name), bytes);
  return `/images/products/${name}`;
}
