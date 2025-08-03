"use client";

// CORE
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

// API
import { UserService } from "@synq/supabase/services";

// UI COMPONENTS
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

// UTILS
import { toast } from "sonner";

interface NavUserProps {
  isCollapsed?: boolean;
}

export function NavUser({ isCollapsed = false }: NavUserProps) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatarUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Load user when component mounts
  useEffect(() => {
    loadUser();
  }, []); // Add dependency array to prevent infinite calls

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await UserService.getCurrentUser("client");
      setUser({
        name: currentUser.user_metadata?.full_name || currentUser.email || "",
        email: currentUser.email || "",
        avatarUrl: currentUser.user_metadata?.avatar_url || "",
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      // Don't redirect immediately, let the middleware handle authentication
      // Only redirect if we're certain the user is not authenticated
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await UserService.signOut("client");
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      toast.error(message);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Show loading state while user loads
  if (isLoading || !user) {
    return (
      <div className={`p-4 ${isCollapsed ? "px-2" : ""}`}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 opacity-50 ${isCollapsed ? "justify-center p-2" : ""}`}
        >
          <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
            <AvatarImage
              src="/user/avatar_placeholder.png"
              alt="Loading..."
              className="object-cover h-full w-full"
            />
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-sidebar-accent rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-sidebar-accent rounded animate-pulse w-2/3"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center p-0 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-10 h-10 p-0 flex items-center justify-center rounded-xl bg-transparent border-0 shadow-none hover:bg-sidebar-accent/20 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
              aria-label="Open user menu"
            >
              <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
                <AvatarImage
                  src={user.avatarUrl || "/user/avatar_placeholder.png"}
                  alt={user.name || "User avatar"}
                  className="object-cover h-full w-full"
                />
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 bg-background border border-border shadow-lg"
            side="right"
            align="start"
            sideOffset={16}
          >
            <DropdownMenuLabel className="p-0">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarImage
                    src={user.avatarUrl || "/user/avatar_placeholder.png"}
                    alt={user.name || "User avatar"}
                    className="object-cover h-full w-full"
                  />
                </Avatar>
                <div className="text-sm min-w-0">
                  <p className="font-light tracking-[-0.01em] text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://trysynq.com/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 cursor-pointer"
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
                className={`cursor-pointer ${theme === "light" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("dark")}
                className={`cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeChange("system")}
                className={`cursor-pointer ${theme === "system" ? "bg-accent" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Non-collapsed state
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
              <Avatar className="h-10 w-10 rounded-full flex-shrink-0">
                <AvatarImage
                  src={user.avatarUrl || "/user/avatar_placeholder.png"}
                  alt={user.name || "User avatar"}
                  className="object-cover h-full w-full"
                />
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-light tracking-[-0.01em] text-sidebar-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-56 bg-background border border-border shadow-lg"
          side={isCollapsed ? "right" : "right"}
          align={isCollapsed ? "start" : "end"}
          sideOffset={isCollapsed ? 16 : 8}
        >
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage
                  src={user.avatarUrl || "/user/avatar_placeholder.png"}
                  alt={user.name || "User avatar"}
                />
              </Avatar>
              <div className="text-sm min-w-0">
                <p className="font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="https://trysynq.com/help"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 cursor-pointer"
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
              className={`cursor-pointer ${theme === "light" ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleThemeChange("dark")}
              className={`cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleThemeChange("system")}
              className={`cursor-pointer ${theme === "system" ? "bg-accent" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4" />
                <span>System</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
