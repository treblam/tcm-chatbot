// 简化的类型定义（替代数据库 schema）
// 这些类型用于 localStorage 存储和组件间通信

import type { ArtifactKind } from "@/components/artifact";

/**
 * 聊天记录
 */
export type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  visibility?: "private" | "public";
};

/**
 * 消息（数据库格式，已废弃，用于兼容）
 */
export type DBMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  parts: unknown;
  attachments?: unknown;
  createdAt: Date;
};

/**
 * 文档/Artifact
 */
export type Document = {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  createdAt?: Date;
};

/**
 * 建议（用于编辑器内联建议）
 */
export type Suggestion = {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  createdAt: Date;
};

/**
 * 投票（已废弃，保留类型用于兼容）
 */
export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
};
