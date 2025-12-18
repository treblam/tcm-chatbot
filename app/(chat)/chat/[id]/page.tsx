"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getChatById } from "@/lib/storage/local-storage";
import type { ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [chatModel, setChatModel] = useState<string>(DEFAULT_CHAT_MODEL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 加载聊天记录
    const chat = getChatById(id);

    if (!chat) {
      // 聊天不存在，重定向到首页
      router.push("/");
      return;
    }

    // 转换消息格式
    const messages = chat.messages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      parts: msg.parts as ChatMessage["parts"],
      createdAt: new Date(msg.createdAt),
    })) as ChatMessage[];

    setInitialMessages(messages);

    // 从 cookie 获取模型选择
    const chatModelCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("chat-model="));
    if (chatModelCookie) {
      setChatModel(chatModelCookie.split("=")[1]);
    }

    setIsLoading(false);
  }, [id, router]);

  if (isLoading) {
    return <div className="flex h-dvh" />;
  }

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={chatModel}
        initialMessages={initialMessages}
        initialVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler />
    </>
  );
}
