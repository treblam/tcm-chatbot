import { readFile, stat } from "fs/promises";
import path from "path";
import { type NextRequest, NextResponse } from "next/server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = path.join(UPLOAD_DIR, ...pathSegments);

    // 安全检查：确保路径在 UPLOAD_DIR 内
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 检查文件是否存在
    try {
      await stat(resolvedPath);
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 读取文件
    const buffer = await readFile(resolvedPath);

    // 确定 Content-Type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
