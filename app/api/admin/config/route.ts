import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getServerConfig,
  saveServerConfig,
  type AppConfig,
} from "@/lib/config/server-config";
import { clearProviderCache } from "@/lib/ai/providers";

// GET /api/admin/config - 获取配置
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const config = await getServerConfig();

    // 隐藏完整的 API Key，只显示前几位
    const safeConfig = {
      ...config,
      providers: config.providers.map((provider) => ({
        ...provider,
        apiKey: provider.apiKey
          ? `${provider.apiKey.slice(0, 8)}...${provider.apiKey.slice(-4)}`
          : "",
      })),
    };

    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error("Failed to get config:", error);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

// POST /api/admin/config - 保存配置
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const newConfig = (await request.json()) as AppConfig;
    const currentConfig = await getServerConfig();

    // 处理 API Key：如果是隐藏格式，保留原来的 Key
    const updatedProviders = newConfig.providers.map((newProvider) => {
      const existingProvider = currentConfig.providers.find(
        (p) => p.id === newProvider.id
      );

      // 如果 API Key 是隐藏格式，使用原来的 Key
      if (newProvider.apiKey.includes("...") && existingProvider) {
        return {
          ...newProvider,
          apiKey: existingProvider.apiKey,
        };
      }

      return newProvider;
    });

    const finalConfig: AppConfig = {
      ...newConfig,
      providers: updatedProviders,
    };

    await saveServerConfig(finalConfig);

    // 清除 Provider 缓存
    clearProviderCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save config:", error);
    return NextResponse.json({ error: "保存配置失败" }, { status: 500 });
  }
}
