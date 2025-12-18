"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { toast } from "sonner";

type ModelConfig = {
  id: string;
  name: string;
  description?: string;
};

type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: ModelConfig[];
};

type AppConfig = {
  providers: ProviderConfig[];
  defaultModel: string;
  systemPrompt?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig>({
    providers: [],
    defaultModel: "",
    systemPrompt: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 加载配置
  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("加载配置失败");
        setIsLoading(false);
      });
  }, []);

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("配置保存成功");
      } else {
        throw new Error("保存失败");
      }
    } catch {
      toast.error("保存配置失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 添加 Provider
  const addProvider = () => {
    const newProvider: ProviderConfig = {
      id: `provider-${Date.now()}`,
      name: "新 Provider",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      models: [
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          description: "快速且经济的模型",
        },
      ],
    };

    setConfig((prev) => ({
      ...prev,
      providers: [...prev.providers, newProvider],
    }));
  };

  // 删除 Provider
  const removeProvider = (providerId: string) => {
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.filter((p) => p.id !== providerId),
    }));
  };

  // 更新 Provider
  const updateProvider = (
    providerId: string,
    field: keyof ProviderConfig,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId ? { ...p, [field]: value } : p
      ),
    }));
  };

  // 添加 Model
  const addModel = (providerId: string) => {
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      name: "新模型",
      description: "",
    };

    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId ? { ...p, models: [...p.models, newModel] } : p
      ),
    }));
  };

  // 删除 Model（使用索引）
  const removeModel = (providerId: string, modelIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId
          ? { ...p, models: p.models.filter((_, i) => i !== modelIndex) }
          : p
      ),
    }));
  };

  // 更新 Model（使用索引）
  const updateModel = (
    providerId: string,
    modelIndex: number,
    field: keyof ModelConfig,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      providers: prev.providers.map((p) =>
        p.id === providerId
          ? {
              ...p,
              models: p.models.map((m, i) =>
                i === modelIndex ? { ...m, [field]: value } : m
              ),
            }
          : p
      ),
    }));
  };

  // 获取所有模型列表
  const allModels = config.providers.flatMap((p) =>
    p.models.map((m) => ({ ...m, providerName: p.name }))
  );

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin-login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">中医AI助手 - 管理配置</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              返回首页
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Provider 配置 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Provider 配置</h2>
            <Button onClick={addProvider} size="sm">
              <PlusIcon />
              添加 Provider
            </Button>
          </div>

          {config.providers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              暂无 Provider 配置，请点击上方按钮添加
            </div>
          ) : (
            <div className="space-y-6">
              {config.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-lg border bg-card p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Provider 名称
                        </label>
                        <Input
                          value={provider.name}
                          onChange={(e) =>
                            updateProvider(provider.id, "name", e.target.value)
                          }
                          placeholder="例如：OpenAI"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Base URL</label>
                        <Input
                          value={provider.baseUrl}
                          onChange={(e) =>
                            updateProvider(
                              provider.id,
                              "baseUrl",
                              e.target.value
                            )
                          }
                          placeholder="https://api.openai.com/v1"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">API Key</label>
                        <Input
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) =>
                            updateProvider(
                              provider.id,
                              "apiKey",
                              e.target.value
                            )
                          }
                          placeholder="sk-..."
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProvider(provider.id)}
                      className="ml-4 text-destructive hover:text-destructive"
                    >
                      <TrashIcon />
                    </Button>
                  </div>

                  {/* Models */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">模型列表</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addModel(provider.id)}
                      >
                        <PlusIcon />
                        添加模型
                      </Button>
                    </div>

                    {provider.models.length === 0 ? (
                      <div className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">
                        暂无模型配置
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {provider.models.map((model, modelIndex) => (
                          <div
                            key={`${provider.id}-model-${modelIndex}`}
                            className="flex items-center gap-2 rounded-md bg-muted/50 p-3"
                          >
                            <div className="grid flex-1 grid-cols-3 gap-2">
                              <Input
                                value={model.id}
                                onChange={(e) =>
                                  updateModel(
                                    provider.id,
                                    modelIndex,
                                    "id",
                                    e.target.value
                                  )
                                }
                                placeholder="模型 ID"
                                className="h-8 text-sm"
                              />
                              <Input
                                value={model.name}
                                onChange={(e) =>
                                  updateModel(
                                    provider.id,
                                    modelIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="显示名称"
                                className="h-8 text-sm"
                              />
                              <Input
                                value={model.description || ""}
                                onChange={(e) =>
                                  updateModel(
                                    provider.id,
                                    modelIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="描述（可选）"
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeModel(provider.id, modelIndex)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 默认模型 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">默认模型</h2>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">选择默认模型</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.defaultModel}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    defaultModel: e.target.value,
                  }))
                }
              >
                <option value="">请选择...</option>
                {allModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.providerName} - {model.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                用户首次访问时默认使用的模型
              </p>
            </div>
          </div>
        </section>

        {/* 系统提示词 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">系统提示词</h2>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">自定义系统提示词</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={config.systemPrompt || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    systemPrompt: e.target.value,
                  }))
                }
                placeholder="输入自定义系统提示词（可选）..."
              />
              <p className="text-sm text-muted-foreground">
                此提示词将作为所有对话的系统消息前缀
              </p>
            </div>
          </div>
        </section>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </div>
    </div>
  );
}
