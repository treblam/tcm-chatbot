import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 未登录或不是管理员，重定向到登录页
  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin-login");
  }

  return <>{children}</>;
}
