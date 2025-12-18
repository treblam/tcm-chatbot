export interface LocalMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: unknown[];
  createdAt: string;
  attachments?: unknown[];
}

export interface LocalChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: LocalMessage[];
}

export interface LocalDocument {
  id: string;
  title: string;
  kind: string;
  content: string;
  createdAt: string;
  versions: LocalDocumentVersion[];
}

export interface LocalDocumentVersion {
  content: string;
  createdAt: string;
}

export const STORAGE_KEYS = {
  CHATS: "tcm-chatbot-chats",
  DOCUMENTS: "tcm-chatbot-documents",
  SETTINGS: "tcm-chatbot-settings",
} as const;
