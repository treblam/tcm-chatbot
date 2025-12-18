// 简化的权限配置 - 所有用户使用相同的配额
// 由于移除了用户认证系统，不再区分用户类型

type Entitlements = {
  maxMessagesPerDay: number;
};

// 默认配额 - 所有匿名用户共享
export const defaultEntitlements: Entitlements = {
  maxMessagesPerDay: 100, // 每天最多100条消息
};

// 获取用户权限（目前所有用户使用相同配额）
export function getEntitlements(): Entitlements {
  return defaultEntitlements;
}
