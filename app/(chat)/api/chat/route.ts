import { readFile } from "fs/promises";
import path from "path";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { getServerConfig, getSystemPrompt } from "@/lib/config/server-config";
import type { ChatModel } from "@/lib/ai/models";
import { getLanguageModel } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { postRequestBodySchema } from "./schema";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/data/uploads";

// 将本地文件 URL 转换为 base64 data URL
async function convertLocalFilesToBase64(
  messages: ChatMessage[]
): Promise<ChatMessage[]> {
  const processedMessages: ChatMessage[] = [];

  for (const message of messages) {
    if (!message.parts || !Array.isArray(message.parts)) {
      processedMessages.push(message);
      continue;
    }

    const processedParts = await Promise.all(
      message.parts.map(async (part: any) => {
        // 检查是否是本地文件 URL
        if (
          part.type === "file" &&
          part.url &&
          part.url.startsWith("/api/files/")
        ) {
          try {
            // 从 URL 提取文件路径: /api/files/2025-12-17/xxx.png -> 2025-12-17/xxx.png
            const filePath = part.url.replace("/api/files/", "");
            const fullPath = path.join(UPLOAD_DIR, filePath);

            // 读取文件并转换为 base64
            const fileBuffer = await readFile(fullPath);
            const base64 = fileBuffer.toString("base64");
            const dataUrl = `data:${part.mediaType};base64,${base64}`;

            return {
              ...part,
              url: dataUrl,
            };
          } catch (error) {
            console.error("Failed to convert file to base64:", error);
            return part; // 转换失败时返回原始 part
          }
        }
        return part;
      })
    );

    processedMessages.push({
      ...message,
      parts: processedParts,
    });
  }

  return processedMessages;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  let requestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      messages: previousMessages = [],
      selectedChatModel,
    }: {
      id: string;
      message: ChatMessage;
      messages?: ChatMessage[];
      selectedChatModel: ChatModel["id"];
    } = requestBody;

    // 构建完整消息历史
    const uiMessages = [...previousMessages, message];

    // 将本地文件 URL 转换为 base64（用于发送给 AI 模型）
    const processedMessages = await convertLocalFilesToBase64(uiMessages);

    // 判断是否是新对话，生成标题
    let titlePromise: Promise<string> | null = null;
    if (previousMessages.length === 0) {
      titlePromise = generateTitleFromUserMessage({ message });
    }

    // 获取系统提示词
    const systemPromptText = await getSystemPrompt();

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // 处理标题生成
        if (titlePromise) {
          titlePromise.then((title) => {
            dataStream.write({ type: "data-chat-title", data: title });
          });
        }

        const isReasoningModel =
          selectedChatModel.includes("reasoning") ||
          selectedChatModel.includes("thinking");

        const model = await getLanguageModel(selectedChatModel);

        const result = streamText({
          model,
          system: systemPromptText,
          messages: convertToModelMessages(processedMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools: isReasoningModel
            ? []
            : ["getWeather", "createDocument", "updateDocument"],
          experimental_transform: isReasoningModel
            ? undefined
            : smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
            createDocument: createDocument({ dataStream }),
            updateDocument: updateDocument({ dataStream }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onError: () => {
        return "抱歉，发生了错误，请稍后重试。";
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error);
    return new ChatSDKError("offline:chat").toResponse();
  }
}
