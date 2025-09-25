"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";

import { UserService } from "@synq/supabase/services";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
} from "@synq/ui/component";

import {
  LogOut,
  Settings,
  MessageCircle,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

import { toast } from "sonner";

interface NavUserProps {
  isCollapsed?: boolean;
}

// Helper to create initials like "JD"
function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function NavUser({ isCollapsed = false }: NavUserProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const u = await UserService.getCurrentUser("client");
      return {
        name: u.user_metadata?.full_name || u.email || "",
        email: u.email || "",
        avatarUrl: u.user_metadata?.avatar_url || "",
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSignOut = async () => {
    try {
      await UserService.signOut("client");
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sign out";
      toast.error(msg);
    }
  };

  const handleThemeChange = (t: string) => setTheme(t);

  // shared avatar element
  const avatar = (
    <Avatar
      className={`h-10 w-10 ${isCollapsed ? "rounded-xl" : "rounded-full"} flex-shrink-0`}
    >
      <AvatarImage
        src={user?.avatarUrl || undefined}
        alt={user?.name || "User avatar"}
        className="object-cover h-full w-full"
      />
      <AvatarFallback>
        {isLoading ? "?" : getInitials(user?.name || user?.email || "")}
      </AvatarFallback>
    </Avatar>
  );

  // collapsed
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center p-0 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-10 h-10 p-0 flex items-center justify-center rounded-xl hover:bg-sidebar-accent/20 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              aria-label="Open user menu"
            >
              {avatar}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 bg-background border border-border shadow-lg"
            side="right"
            align="start"
            sideOffset={16}
          >
            {isLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {avatar}
                    <div className="text-sm min-w-0">
                      <p className="font-light tracking-[-0.01em] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("light")}
                    className={theme === "light" ? "bg-accent" : ""}
                  >
                    <Sun className="h-4 w-4 mr-2" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("dark")}
                    className={theme === "dark" ? "bg-accent" : ""}
                  >
                    <Moon className="h-4 w-4 mr-2" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleThemeChange("system")}
                    className={theme === "system" ? "bg-accent" : ""}
                  >
                    <Monitor className="h-4 w-4 mr-2" /> System
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // expanded
  return (
    <div className={`p-4 ${isCollapsed ? "px-2" : ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`justify-start h-auto rounded-lg border border-sidebar-border bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors ${
              isCollapsed ? "w-12 h-12 p-2" : "w-full p-3"
            }`}
          >
            <div
              className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "w-full"}`}
            >
              {avatar}
              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  {isLoading ? (
                    <>
                      <div className="h-4 bg-sidebar-accent/50 rounded animate-pulse mb-1" />
                      <div className="h-3 bg-sidebar-accent/50 rounded animate-pulse w-2/3" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-light tracking-[-0.01em] truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </>
                  )}
                </div>
              )}
              {!isCollapsed && !isLoading && (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-56 bg-background border border-border shadow-lg"
          side="right"
          align="end"
          sideOffset={8}
        >
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              {/* same menu items as collapsed */}
              <DropdownMenuLabel className="p-0">
                <div className="flex items-center gap-3 px-3 py-2">
                  {avatar}
                  <div className="text-sm min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="https://trysynq.com/help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contact Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleThemeChange("light")}
                  className={theme === "light" ? "bg-accent" : ""}
                >
                  <Sun className="h-4 w-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleThemeChange("dark")}
                  className={theme === "dark" ? "bg-accent" : ""}
                >
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleThemeChange("system")}
                  className={theme === "system" ? "bg-accent" : ""}
                >
                  <Monitor className="h-4 w-4 mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
