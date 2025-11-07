import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = file as unknown as File;
    const mime = blob.type || "";
    if (!ALLOWED_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const ext =
      mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
    const base = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${base}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, buffer);

    const publicPath = `/uploads/${filename}`;
    const apiPath = `/api/images/${filename}`;

    return NextResponse.json(
      {
        path: apiPath, // Use API route for reliable serving
        staticPath: publicPath, // Keep static path as backup
        filename,
        size: blob.size,
        mimeType: mime,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
