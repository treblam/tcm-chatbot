import "server-only";

import {
  createOpenAICompatible,
  type OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible";
import { customProvider, type LanguageModel } from "ai";
import { getServerConfig } from "../config/server-config";
import { isTestEnvironment } from "../constants";

// 缓存 provider 实例
const providerCache: Map<string, OpenAICompatibleProvider<string>> = new Map();

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

async function getOpenAICompatibleProvider(
  modelId: string
): Promise<{
  provider: OpenAICompatibleProvider<string>;
  actualModelId: string;
}> {
  const config = await getServerConfig();

  // 查找包含该模型的 provider
  for (const providerConfig of config.providers) {
    const model = providerConfig.models.find((m) => m.id === modelId);
    if (model) {
      const cacheKey = `${providerConfig.id}-${providerConfig.baseUrl}`;

      if (!providerCache.has(cacheKey)) {
        const provider = createOpenAICompatible({
          name: providerConfig.name,
          baseURL: providerConfig.baseUrl,
          apiKey: providerConfig.apiKey,
        });
        providerCache.set(cacheKey, provider);
      }

      return {
        provider: providerCache.get(cacheKey) as OpenAICompatibleProvider<string>,
        actualModelId: modelId,
      };
    }
  }

  // 如果没有找到，使用第一个 provider 的第一个模型
  const firstProvider = config.providers[0];
  if (firstProvider) {
    const cacheKey = `${firstProvider.id}-${firstProvider.baseUrl}`;

    if (!providerCache.has(cacheKey)) {
      const provider = createOpenAICompatible({
        name: firstProvider.name,
        baseURL: firstProvider.baseUrl,
        apiKey: firstProvider.apiKey,
      });
      providerCache.set(cacheKey, provider);
    }

    return {
      provider: providerCache.get(cacheKey) as OpenAICompatibleProvider<string>,
      actualModelId: firstProvider.models[0]?.id || modelId,
    };
  }

  throw new Error(`Model ${modelId} not found and no providers configured`);
}

export async function getLanguageModel(modelId: string): Promise<LanguageModel> {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const { provider, actualModelId } =
    await getOpenAICompatibleProvider(modelId);
  return provider(actualModelId);
}

export async function getTitleModel(): Promise<LanguageModel> {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const config = await getServerConfig();
  const { provider, actualModelId } = await getOpenAICompatibleProvider(
    config.defaultModel
  );
  return provider(actualModelId);
}

export async function getArtifactModel(): Promise<LanguageModel> {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }

  const config = await getServerConfig();
  const { provider, actualModelId } = await getOpenAICompatibleProvider(
    config.defaultModel
  );
  return provider(actualModelId);
}

// 清除缓存（配置更新时调用）
export function clearProviderCache(): void {
  providerCache.clear();
}
