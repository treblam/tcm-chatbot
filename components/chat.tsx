"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useLocalChats } from "@/hooks/use-local-chats";
import { ChatSDKError } from "@/lib/errors";
import {
  createChat,
  getChatById,
  updateChatMessages,
  updateChatTitle,
} from "@/lib/storage/local-storage";
import type { LocalMessage } from "@/lib/storage/types";
import type { Attachment, ChatMessage } from "@/lib/types";
import { fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}) {
  const router = useRouter();
  const { refresh } = useLocalChats();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const { dataStream, setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);
  const chatCreatedRef = useRef(false);

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  // 将 ChatMessage[] 转换为 LocalMessage[]
  const convertToLocalMessages = useCallback(
    (msgs: ChatMessage[]): LocalMessage[] => {
      return msgs.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        parts: msg.parts as unknown[],
        createdAt: new Date().toISOString(),
        attachments: undefined,
      }));
    },
    []
  );

  // 保存消息到 localStorage
  const saveMessagesToStorage = useCallback(
    (msgs: ChatMessage[]) => {
      if (msgs.length === 0) return;
      updateChatMessages(id, convertToLocalMessages(msgs));
      refresh();
    },
    [id, convertToLocalMessages, refresh]
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      // 对话完成后保存到 localStorage
      // messages 在 onFinish 时可能还没更新，使用 setTimeout 确保获取最新状态
      setTimeout(() => {
        saveMessagesToStorage(messages);
      }, 100);
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: "error",
          description: error.message,
        });
      }
    },
  });

  // 包装 sendMessage，在发送第一条消息时立即创建聊天并刷新侧边栏
  const handleSendMessage = useCallback(
    async (message: Parameters<typeof sendMessage>[0]) => {
      // 如果聊天不存在，立即创建
      const existingChat = getChatById(id);
      if (!existingChat && !chatCreatedRef.current && message) {
        const textPart = message.parts?.find((p: any) => p.type === "text");
        const title = (textPart as any)?.text?.slice(0, 50) || "新对话";
        createChat(id, title);
        chatCreatedRef.current = true;
        refresh(); // 立即刷新侧边栏
      }

      return sendMessage(message);
    },
    [id, sendMessage, refresh]
  );

  // 监听 data stream 中的标题更新
  useEffect(() => {
    if (dataStream) {
      for (const part of dataStream) {
        if (
          part.type === "data-chat-title" &&
          typeof part.data === "string"
        ) {
          updateChatTitle(id, part.data);
          refresh();
        }
      }
    }
  }, [dataStream, id, refresh]);

  // 当消息更新时保存到 localStorage
  useEffect(() => {
    if (messages.length > 0 && status === "ready") {
      saveMessagesToStorage(messages);
    }
  }, [messages, status, saveMessagesToStorage]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      handleSendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, handleSendMessage, hasAppendedQuery, id]);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader chatId={id} />

        <Messages
          chatId={id}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          setMessages={setMessages}
          status={status}
          votes={undefined}
        />

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={handleSendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          )}
        </div>
      </div>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={handleSendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={undefined}
      />
    </>
  );
}
