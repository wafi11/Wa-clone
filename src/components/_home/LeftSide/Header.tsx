"use client";
import ThemeSwitch from "@/components/ui/ToogleTheme";
import { UserButton } from "@clerk/nextjs";
import UserListDialog from "../_components/userListDialog";
import { useConvexAuth } from "convex/react";

export default function HeaderLeftSide() {
  const { isAuthenticated } = useConvexAuth();
  return (
    <div className="flex justify-between bg-gray-primary p-3 items-center">
      <UserButton />

      <div className="flex items-center gap-3">
        {isAuthenticated && <UserListDialog />}
        <ThemeSwitch />
      </div>
    </div>
  );
}
