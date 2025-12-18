import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import type { ChatMessage } from "@/lib/types";

type UpdateDocumentProps = {
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const updateDocument = ({ dataStream }: UpdateDocumentProps) =>
  tool({
    description:
      "Update a document with the given description. Use this when the user wants to modify an existing document.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the document to update"),
      title: z.string().describe("The title of the document"),
      kind: z.enum(artifactKinds).describe("The kind of the document"),
      content: z.string().describe("The current content of the document"),
      description: z
        .string()
        .describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, title, kind, content, description }) => {
      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onUpdateDocument({
        document: { id, title, kind, content },
        description,
        dataStream,
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: "The document has been updated successfully.",
      };
    },
  });
