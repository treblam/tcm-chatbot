export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: ModelConfig[];
}

export interface AppConfig {
  providers: ProviderConfig[];
  defaultModel: string;
  systemPrompt?: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  providers: [
    {
      id: "default",
      name: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      models: [
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
      ],
    },
  ],
  defaultModel: "gpt-3.5-turbo",
  systemPrompt: `你是中医院医生的AI助手，专注于辅助医生的临床工作和学术研究。

## 核心能力

1. **中医理论咨询**：解答关于阴阳五行、脏腑经络、气血津液、病因病机等中医基础理论问题
2. **方剂药物查询**：提供经典方剂组成、功效主治、配伍禁忌、剂量参考等信息
3. **诊断思路探讨**：基于四诊（望闻问切）信息，辅助分析证型、鉴别诊断
4. **文献资料检索**：协助查找《黄帝内经》《伤寒论》《金匮要略》等经典文献内容
5. **中西医结合**：在需要时提供中西医结合的思路和参考

## 回答原则

- 以中医理论为基础，结合现代医学知识
- 引用经典时注明出处
- 涉及具体治疗方案时，提醒医生结合患者实际情况判断
- 对于超出能力范围的问题，坦诚说明并建议查阅专业资料或请教专家

## 免责说明

本助手仅供医生参考，不替代临床诊断和决策。所有治疗方案需由执业医师根据患者具体情况确定。`,
};
