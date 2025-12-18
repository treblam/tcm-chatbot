import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateUUID } from "@/lib/utils";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "文件大小不能超过 5MB",
    })
    .refine((file) => ALLOWED_TYPES.includes(file.type), {
      message: "文件类型必须是 JPEG、PNG、GIF 或 WebP",
    }),
});

export async function POST(request: Request) {
  if (request.body === null) {
    return new Response("请求体为空", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 获取原始文件名
    const originalFile = formData.get("file") as File;
    const originalName = originalFile.name;
    const ext = path.extname(originalName) || getExtFromMimeType(file.type);

    // 生成唯一文件名
    const uniqueName = `${generateUUID()}${ext}`;

    // 按日期组织目录
    const today = new Date().toISOString().split("T")[0];
    const uploadPath = path.join(UPLOAD_DIR, today);

    try {
      // 确保目录存在
      await mkdir(uploadPath, { recursive: true });

      // 写入文件
      const filePath = path.join(uploadPath, uniqueName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // 返回访问 URL
      const url = `/api/files/${today}/${uniqueName}`;

      return NextResponse.json({
        url,
        pathname: originalName,
        contentType: file.type,
      });
    } catch (error) {
      console.error("File upload error:", error);
      return NextResponse.json({ error: "文件上传失败" }, { status: 500 });
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json({ error: "请求处理失败" }, { status: 500 });
  }
}

function getExtFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return map[mimeType] || ".bin";
}
