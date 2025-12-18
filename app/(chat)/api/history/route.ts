// History API - 前端使用 localStorage，此 API 仅作为占位符
// 聊天历史完全在客户端 localStorage 中管理

export async function GET() {
  // 返回空数组，前端从 localStorage 获取历史
  return Response.json([]);
}

export async function DELETE() {
  // 返回成功，前端负责清除 localStorage
  return Response.json({ success: true }, { status: 200 });
}
