import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin-login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isAdminLoginPage = nextUrl.pathname === "/admin-login";

      // 管理员页面需要管理员登录
      if (isAdminPage && !isAdminLoginPage) {
        if (isAdmin) return true;
        return Response.redirect(new URL("/admin-login", nextUrl));
      }

      // 其他页面允许所有人访问
      return true;
    },
  },
} satisfies NextAuthConfig;
