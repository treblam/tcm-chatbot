// 客户端安全的模型相关类型和静态数据
// 动态数据应通过 /api/models 获取

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

// 默认模型 ID
export const DEFAULT_CHAT_MODEL = "gpt-3.5-turbo";

// 静态默认模型列表（用于初始加载，实际使用时通过 API 获取）
export const chatModels: ChatModel[] = [
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "openai",
    description: "快速且经济实惠",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "openai",
    description: "更强大的推理能力",
  },
];

// 静态分组（用于初始加载）
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
