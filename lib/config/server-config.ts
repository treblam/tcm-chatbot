import "server-only";

import fs from "fs/promises";
import path from "path";
import { type AppConfig, DEFAULT_CONFIG } from "./types";

// Re-export types for convenience
export type { AppConfig, ModelConfig, ProviderConfig } from "./types";

const CONFIG_PATH = process.env.CONFIG_PATH || "/data/config.json";

let configCache: AppConfig | null = null;

export async function getServerConfig(): Promise<AppConfig> {
  if (configCache) {
    return configCache;
  }

  try {
    const configData = await fs.readFile(CONFIG_PATH, "utf-8");
    configCache = JSON.parse(configData);
    return configCache as AppConfig;
  } catch {
    // 配置文件不存在，返回默认配置
    return DEFAULT_CONFIG;
  }
}

export async function saveServerConfig(config: AppConfig): Promise<void> {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  // 清除缓存
  configCache = null;
}

export function clearConfigCache(): void {
  configCache = null;
}

export async function getDefaultModel(): Promise<string> {
  const config = await getServerConfig();
  return config.defaultModel;
}

export async function getSystemPrompt(): Promise<string> {
  const config = await getServerConfig();
  return config.systemPrompt || "你是一个友好的AI助手。";
}
