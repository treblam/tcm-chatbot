import "server-only";

import { getServerConfig } from "../config/server-config";
import type { ModelConfig } from "../config/types";
import type { ChatModel } from "./models";

// 动态获取模型列表（仅服务端使用）
export async function getChatModels(): Promise<ChatModel[]> {
  const config = await getServerConfig();
  return config.providers.flatMap((provider) =>
    provider.models.map((model: ModelConfig) => ({
      id: model.id,
      name: model.name,
      provider: model.provider || provider.name,
      description: model.description || "",
    }))
  );
}

// 动态获取按 provider 分组的模型（仅服务端使用）
export async function getModelsByProvider(): Promise<
  Record<string, ChatModel[]>
> {
  const models = await getChatModels();
  return models.reduce(
    (acc, model) => {
      const providerKey = model.provider;
      if (!acc[providerKey]) {
        acc[providerKey] = [];
      }
      acc[providerKey].push(model);
      return acc;
    },
    {} as Record<string, ChatModel[]>
  );
}

// 动态获取默认模型（仅服务端使用）
export async function getDefaultChatModel(): Promise<string> {
  const config = await getServerConfig();
  return config.defaultModel;
}
