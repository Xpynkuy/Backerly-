import path from "path";
import sharp from "sharp";
import { ensureDir, makeFileName } from "./files";

const AVATAR_SIZE   = 160;
const BANNER_WIDTH  = 1300;
const BANNER_HEIGHT = 260;
const POST_WIDTH    = 540;
const POST_HEIGHT   = 300;

const avatarsDir = path.join(process.cwd(), "uploads/avatars");
const bannersDir = path.join(process.cwd(), "uploads/banners");
const postDir    = path.join(process.cwd(), "uploads/posts");

ensureDir(avatarsDir);
ensureDir(bannersDir);
ensureDir(postDir);

export async function saveAvatar(buffer: Buffer): Promise<string> {
  const fileName = makeFileName("webp");
  const filePath = path.join(avatarsDir, fileName);

  await sharp(buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/uploads/avatars/${fileName}`;
}

export async function saveBanner(buffer: Buffer): Promise<string> {
  const fileName = makeFileName("webp");
  const filePath = path.join(bannersDir, fileName);

  await sharp(buffer)
    .resize(BANNER_WIDTH, BANNER_HEIGHT, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/uploads/banners/${fileName}`;
}

export async function savePost(buffer: Buffer): Promise<string> {
  const fileName = makeFileName("webp");
  const filePath = path.join(postDir, fileName);

  await sharp(buffer)
    .resize(POST_WIDTH, POST_HEIGHT, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/uploads/posts/${fileName}`;
}
