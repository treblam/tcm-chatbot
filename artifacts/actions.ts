"use server";

import type { Suggestion } from "@/lib/schema";

// 由于移除了数据库，建议功能暂时返回空数组
// 如需实现建议功能，可以在前端 localStorage 中存储
export async function getSuggestions({
  documentId,
}: {
  documentId: string;
}): Promise<Suggestion[]> {
  // TODO: 如需要，可从 localStorage 或其他存储获取建议
  return [];
}
