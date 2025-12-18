"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import { titlePrompt } from "@/lib/ai/prompts";
import { getTitleModel } from "@/lib/ai/providers";
import { getTextFromMessage } from "@/lib/utils";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    const model = await getTitleModel();
    const { text: title } = await generateText({
      model,
      system: titlePrompt,
      prompt: getTextFromMessage(message),
    });

    return title || "新对话";
  } catch (error) {
    console.error("Failed to generate title:", error);
    return "新对话";
  }
}

// 删除尾部消息 - 由于使用 localStorage，实际删除在前端完成
// 此函数仅作为占位符，保持接口兼容
export async function deleteTrailingMessages({ id }: { id: string }) {
  // 消息在前端 setMessages 中处理，服务端无需操作
  return { success: true };
}

// 更新聊天可见性 - 由于使用 localStorage，实际更新在前端完成
// 此函数仅作为占位符，保持接口兼容
export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  // 可见性在前端 localStorage 中管理，服务端无需操作
  return { success: true };
}
