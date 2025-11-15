import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const mime = file.type;
  const allowed = ["image/png","image/jpeg","image/webp","audio/mpeg","audio/wav","application/pdf","application/octet-stream"];
  if (!allowed.includes(mime)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);
  const url = `/uploads/${filename}`;
  return NextResponse.json({ ok: true, url, mime, size: buffer.length });
}