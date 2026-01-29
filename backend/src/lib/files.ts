import fs from "fs";
import path from "path";
import crypto from "crypto";

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function makeFileName(ext = "webp") {
  return `${crypto.randomUUID()}.${ext}`;
}

export function safeUnlink(filePath: string) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

export function urlToAbsoluteUploadPath(url: string) {
  const uploadsRoot = path.join(process.cwd(), "uploads");

  const relative = url.replace(/^\/uploads\//, "");

  const absolute = path.join(uploadsRoot, relative);

  if (!absolute.startsWith(uploadsRoot)) {
    throw new Error("Invalid upload path");
  }
  return absolute;
}

export const deleteFile = async (relativePath?: string | null) => {
  if (!relativePath) return;

  try {
    const normalized = relativePath.startsWith("/")
      ? relativePath.slice(1)
      : relativePath;
    const filePath = path.join(process.cwd(), normalized);
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
    console.log("Delete file", filePath);
  } catch (err: any) {
    console.warn("Failed to delete file", relativePath, err?.message);
  }
};
