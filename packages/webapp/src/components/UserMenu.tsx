import type { UserProfile } from "@challenger-fantasy/types";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { logoutFn } from "~/lib/server-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserMenu({ profile }: { profile: UserProfile }) {
  const { mutate } = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      redirect({ to: "/join" });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="size-8 flex items-center justify-center rounded-full bg-base-100 transition cursor-pointer"
          aria-label="Open user menu"
          type="button"
        >
          <UserRound className="size-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="min-w-48 shadow-lg p-1 z-20" sideOffset={8}>
          <div className="flex items-center gap-x-1 px-3 py-2 font-semibold text-foreground opacity-75 select-none pointer-events-none">
            Hi, {profile.username}
          </div>
          <DropdownMenuSeparator className="h-px my-1" />
          <DropdownMenuItem
            asChild
            className="px-3 py-2 cursor-pointer hover:bg-base-200 transition"
          >
            <button type="button" onClick={() => mutate({})} tabIndex={0}>
              <LogOut className="size-4" />
              Log out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
