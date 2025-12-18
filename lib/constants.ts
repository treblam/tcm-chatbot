export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

// 匿名用户正则（已废弃，保留用于兼容）
// 由于移除了 guest 用户功能，此正则永远不会匹配
export const guestRegex = /^$/;
