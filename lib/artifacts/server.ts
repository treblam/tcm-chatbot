import type { UIMessageStreamWriter } from "ai";
import { codeDocumentHandler } from "@/artifacts/code/server";
import { sheetDocumentHandler } from "@/artifacts/sheet/server";
import { textDocumentHandler } from "@/artifacts/text/server";
import type { ArtifactKind } from "@/components/artifact";
import type { ChatMessage } from "../types";

// 简化的文档类型（不依赖数据库 schema）
export type Document = {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
};

export type CreateDocumentCallbackProps = {
  id: string;
  title: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export type UpdateDocumentCallbackProps = {
  document: Document;
  description: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export type DocumentHandler<T = ArtifactKind> = {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
};

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      // 生成文档内容并流式传输到前端
      // 内容将在前端保存到 localStorage
      await config.onCreateDocument({
        id: args.id,
        title: args.title,
        dataStream: args.dataStream,
      });
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      // 更新文档内容并流式传输到前端
      // 更新后的内容将在前端保存到 localStorage
      await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
      });
    },
  };
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: DocumentHandler[] = [
  textDocumentHandler,
  codeDocumentHandler,
  sheetDocumentHandler,
];

export const artifactKinds = ["text", "code", "sheet"] as const;
