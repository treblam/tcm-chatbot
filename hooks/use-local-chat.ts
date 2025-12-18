"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createChat,
  deleteAllChats,
  deleteChatById,
  getChatById,
  getChats,
  saveChat,
  updateChatMessages,
  updateChatTitle,
} from "@/lib/storage/local-storage";
import type { LocalChat, LocalMessage } from "@/lib/storage/types";

export function useLocalChats() {
  const [chats, setChats] = useState<LocalChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载
  useEffect(() => {
    setChats(getChats());
    setIsLoading(false);
  }, []);

  // 刷新聊天列表
  const refreshChats = useCallback(() => {
    setChats(getChats());
  }, []);

  // 创建新聊天
  const createNewChat = useCallback(
    (id: string, title = "新对话") => {
      const chat = createChat(id, title);
      refreshChats();
      return chat;
    },
    [refreshChats]
  );

  // 删除聊天
  const removeChat = useCallback(
    (id: string) => {
      deleteChatById(id);
      refreshChats();
    },
    [refreshChats]
  );

  // 清除所有聊天
  const clearAllChatsAction = useCallback(() => {
    deleteAllChats();
    refreshChats();
  }, [refreshChats]);

  // 更新聊天标题
  const updateTitle = useCallback(
    (chatId: string, title: string) => {
      updateChatTitle(chatId, title);
      refreshChats();
    },
    [refreshChats]
  );

  // 保存聊天
  const saveChatAction = useCallback(
    (chat: LocalChat) => {
      saveChat(chat);
      refreshChats();
    },
    [refreshChats]
  );

  // 更新聊天消息
  const updateMessages = useCallback(
    (chatId: string, messages: LocalMessage[]) => {
      updateChatMessages(chatId, messages);
      refreshChats();
    },
    [refreshChats]
  );

  return {
    chats,
    isLoading,
    createChat: createNewChat,
    removeChat,
    clearAllChats: clearAllChatsAction,
    updateTitle,
    saveChat: saveChatAction,
    updateMessages,
    refreshChats,
    getChatById,
  };
}

export function useLocalChat(chatId: string) {
  const [chat, setChat] = useState<LocalChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localChat = getChatById(chatId);
    setChat(localChat);
    setIsLoading(false);
  }, [chatId]);

  const refresh = useCallback(() => {
    const localChat = getChatById(chatId);
    setChat(localChat);
  }, [chatId]);

  const updateMessages = useCallback(
    (messages: LocalMessage[]) => {
      updateChatMessages(chatId, messages);
      refresh();
    },
    [chatId, refresh]
  );

  const updateTitle = useCallback(
    (title: string) => {
      updateChatTitle(chatId, title);
      refresh();
    },
    [chatId, refresh]
  );

  return {
    chat,
    isLoading,
    refresh,
    updateMessages,
    updateTitle,
  };
}
