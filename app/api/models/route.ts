import { getChatModels, getModelsByProvider } from "@/lib/ai/models.server";
import { getServerConfig } from "@/lib/config/server-config";

export async function GET() {
  try {
    const config = await getServerConfig();
    const models = await getChatModels();
    const modelsByProvider = await getModelsByProvider();

    return Response.json({
      models,
      modelsByProvider,
      defaultModel: config.defaultModel,
    });
  } catch (error) {
    console.error("Failed to get models:", error);
    return Response.json(
      { error: "Failed to load models" },
      { status: 500 }
    );
  }
}
