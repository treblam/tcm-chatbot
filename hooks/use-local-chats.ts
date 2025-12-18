"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createChat,
  deleteChatById,
  deleteAllChats,
  getChats,
  getChatById,
  updateChatTitle,
  updateChatMessages,
} from "@/lib/storage/local-storage";
import type { LocalChat, LocalMessage } from "@/lib/storage/types";
import type { Chat } from "@/lib/schema";

// 转换 LocalChat 为 Chat 类型（用于组件兼容）
function toChat(localChat: LocalChat): Chat {
  return {
    id: localChat.id,
    title: localChat.title,
    createdAt: new Date(localChat.createdAt),
    updatedAt: new Date(localChat.updatedAt),
    visibility: "private",
  };
}

export function useLocalChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载所有聊天
  const loadChats = useCallback(() => {
    const localChats = getChats();
    setChats(localChats.map(toChat));
    setIsLoading(false);
  }, []);

  // 初始加载
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // 监听其他组件触发的更新事件
  useEffect(() => {
    const handleChatsUpdated = () => {
      loadChats();
    };

    window.addEventListener("chats-updated", handleChatsUpdated);
    return () => {
      window.removeEventListener("chats-updated", handleChatsUpdated);
    };
  }, [loadChats]);

  // 创建新聊天
  const createNewChat = useCallback((id: string, title = "新对话") => {
    const newChat = createChat(id, title);
    setChats((prev) => [toChat(newChat), ...prev]);
    return newChat;
  }, []);

  // 删除聊天
  const deleteChat = useCallback((id: string) => {
    deleteChatById(id);
    setChats((prev) => prev.filter((chat) => chat.id !== id));
  }, []);

  // 清空所有聊天
  const clearAllChatHistory = useCallback(() => {
    deleteAllChats();
    setChats([]);
  }, []);

  // 更新聊天标题
  const updateTitle = useCallback((chatId: string, title: string) => {
    updateChatTitle(chatId, title);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
      )
    );
  }, []);

  // 刷新聊天列表
  const refresh = useCallback(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    isLoading,
    createNewChat,
    deleteChat,
    clearAllChatHistory,
    updateTitle,
    refresh,
  };
}

// Hook for managing a single chat's messages
export function useLocalChatMessages(chatId: string) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [chat, setChat] = useState<LocalChat | null>(null);

  // 加载聊天消息
  useEffect(() => {
    const localChat = getChatById(chatId);
    if (localChat) {
      setChat(localChat);
      setMessages(localChat.messages);
    }
  }, [chatId]);

  // 保存消息到 localStorage
  const saveMessages = useCallback(
    (newMessages: LocalMessage[]) => {
      updateChatMessages(chatId, newMessages);
      setMessages(newMessages);
    },
    [chatId]
  );

  // 添加单条消息
  const addMessage = useCallback(
    (message: LocalMessage) => {
      const newMessages = [...messages, message];
      saveMessages(newMessages);
    },
    [messages, saveMessages]
  );

  return {
    chat,
    messages,
    saveMessages,
    addMessage,
  };
}
