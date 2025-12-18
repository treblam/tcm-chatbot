"use client";

import {
  STORAGE_KEYS,
  type LocalChat,
  type LocalDocument,
  type LocalMessage,
} from "./types";

// ============ Chat Operations ============

export function getChats(): LocalChat[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHATS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getChatById(id: string): LocalChat | null {
  const chats = getChats();
  return chats.find((chat) => chat.id === id) || null;
}

export function saveChat(chat: LocalChat): void {
  if (typeof window === "undefined") return;
  const chats = getChats();
  const index = chats.findIndex((c) => c.id === chat.id);

  if (index >= 0) {
    chats[index] = chat;
  } else {
    chats.unshift(chat);
  }

  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

export function createChat(id: string, title = "新对话"): LocalChat {
  const chat: LocalChat = {
    id,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  saveChat(chat);

  // 触发自定义事件通知其他组件
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chats-updated"));
  }

  return chat;
}

export function updateChatTitle(chatId: string, title: string): void {
  if (typeof window === "undefined") return;
  const chats = getChats();
  const chat = chats.find((c) => c.id === chatId);
  if (chat) {
    chat.title = title;
    chat.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }
}

export function deleteChatById(id: string): void {
  if (typeof window === "undefined") return;
  const chats = getChats().filter((chat) => chat.id !== id);
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

export function deleteAllChats(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify([]));
}

export function addMessageToChat(chatId: string, message: LocalMessage): void {
  if (typeof window === "undefined") return;
  const chats = getChats();
  const chat = chats.find((c) => c.id === chatId);

  if (chat) {
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }
}

export function updateChatMessages(
  chatId: string,
  messages: LocalMessage[]
): void {
  if (typeof window === "undefined") return;
  const chats = getChats();
  const chat = chats.find((c) => c.id === chatId);

  if (chat) {
    chat.messages = messages;
    chat.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }
}

// ============ Document Operations ============

export function getDocuments(): LocalDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getDocumentById(id: string): LocalDocument | null {
  const documents = getDocuments();
  return documents.find((doc) => doc.id === id) || null;
}

export function saveDocument(document: LocalDocument): void {
  if (typeof window === "undefined") return;
  const documents = getDocuments();
  const index = documents.findIndex((d) => d.id === document.id);

  if (index >= 0) {
    documents[index] = document;
  } else {
    documents.push(document);
  }

  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
}

export function createDocument(
  id: string,
  title: string,
  kind: string,
  content = ""
): LocalDocument {
  const document: LocalDocument = {
    id,
    title,
    kind,
    content,
    createdAt: new Date().toISOString(),
    versions: [],
  };
  saveDocument(document);
  return document;
}

export function updateDocumentContent(id: string, content: string): void {
  if (typeof window === "undefined") return;
  const documents = getDocuments();
  const doc = documents.find((d) => d.id === id);

  if (doc) {
    // 保存当前版本到历史
    doc.versions.push({
      content: doc.content,
      createdAt: doc.createdAt,
    });
    doc.content = content;
    doc.createdAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }
}

export function deleteDocumentById(id: string): void {
  if (typeof window === "undefined") return;
  const documents = getDocuments().filter((doc) => doc.id !== id);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
}

// ============ Utility Functions ============

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CHATS);
  localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
