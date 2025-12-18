"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { deleteAllChats } from "@/lib/storage/local-storage";
import { useLocalChats } from "@/hooks/use-local-chats";

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const { clearAllChatHistory, chats } = useLocalChats();

  const handleDeleteAll = () => {
    try {
      clearAllChatHistory();
      setShowDeleteAllDialog(false);
      router.replace("/");
      router.refresh();
      toast.success("所有对话已删除");
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <>
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-row items-center justify-between">
              <Link
                className="flex flex-row items-center gap-3"
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
              >
                <span className="cursor-pointer rounded-md px-2 font-semibold text-lg hover:bg-muted">
                  中医AI助手
                </span>
              </Link>
              <div className="flex flex-row gap-1">
                {chats.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-8 p-1 md:h-fit md:p-2"
                        onClick={() => setShowDeleteAllDialog(true)}
                        type="button"
                        variant="ghost"
                      >
                        <TrashIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent align="end" className="hidden md:block">
                      清空所有对话
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-8 p-1 md:h-fit md:p-2"
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/");
                        router.refresh();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <PlusIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="end" className="hidden md:block">
                    新建对话
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory />
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 text-center text-muted-foreground text-xs">
            对话记录仅保存在本地浏览器中
          </div>
          {chats.length > 0 && (
            <div className="px-2 pb-2">
              <Button
                className="w-full"
                onClick={() => setShowDeleteAllDialog(true)}
                size="sm"
                variant="outline"
              >
                <TrashIcon />
                清除对话记录
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>清空所有对话？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销，所有对话记录将从浏览器中永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
