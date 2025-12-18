// Document API - 文档存储在前端 localStorage
// 此 API 仅作为占位符，供某些组件使用
// 实际文档内容由前端 localStorage 管理

import { NextResponse } from "next/server";
import type { ArtifactKind } from "@/components/artifact";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Parameter id is missing" }, { status: 400 });
  }

  // 返回空数组，前端从 localStorage 获取文档
  return NextResponse.json([], { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Parameter id is required" }, { status: 400 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } = await request.json();

  // 返回成功，前端负责保存到 localStorage
  return NextResponse.json(
    {
      id,
      content,
      title,
      kind,
      createdAt: new Date(),
    },
    { status: 200 }
  );
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Parameter id is required" }, { status: 400 });
  }

  // 返回成功，前端负责从 localStorage 删除
  return NextResponse.json({ success: true }, { status: 200 });
}
