import { ServiceBase } from "./base-service";
import type { User } from "@supabase/supabase-js";

export interface ProfileData {
  fullName?: string;
  avatarUrl?: string;
}

/**
 * User Service - Handles all user-related operations
 * Methods read like natural conversations
 */
export class UserService extends ServiceBase {
  // ==========================================
  // Authentication - Simple actions
  // ==========================================

  /**
   * Sign in with email OTP (One-Time Password)
   */
  static async signInWithOTP(email: string): Promise<void> {
    return this.execute(
      async () => {
        const client = await this.getClient("client");

        // Add retry logic for connection issues
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { error } = await client.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
              },
            });

            if (error) throw error;
            return; // Success, exit retry loop
          } catch (error) {
            lastError = error as Error;

            // If it's a connection error and not the last attempt, wait and retry
            if (
              attempt < 3 &&
              error instanceof Error &&
              (error.message.includes("fetch failed") ||
                error.message.includes("SocketError") ||
                error.message.includes("other side closed"))
            ) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * attempt),
              ); // Exponential backoff
              continue;
            }

            throw error; // Re-throw if it's the last attempt or not a connection error
          }
        }

        throw (
          lastError || new Error("Failed to send OTP after multiple attempts")
        );
      },
      {
        service: "UserService",
        method: "signInWithOTP",
      },
    );
  }

  /**
   * Verify OTP token for email authentication
   */
  static async verifyOTP(
    email: string,
    token: string,
  ): Promise<{ user: User; redirectTo: string }> {
    return this.execute(
      async () => {
        const client = await this.getClient("client");

        // Add retry logic for connection issues
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { data, error } = await client.auth.verifyOtp({
              email,
              token,
              type: "email",
            });

            if (error) throw error;
            if (!data.user)
              throw new Error("No user returned from verification");

            // Determine redirect destination
            const redirectTo = data.user.user_metadata?.setup_complete
              ? "/home"
              : "/setup-account";

            return {
              user: data.user,
              redirectTo,
            };
          } catch (error) {
            lastError = error as Error;

            // If it's a connection error and not the last attempt, wait and retry
            if (
              attempt < 3 &&
              error instanceof Error &&
              (error.message.includes("fetch failed") ||
                error.message.includes("SocketError") ||
                error.message.includes("other side closed"))
            ) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * attempt),
              ); // Exponential backoff
              continue;
            }

            throw error; // Re-throw if it's the last attempt or not a connection error
          }
        }

        throw (
          lastError || new Error("Failed to verify OTP after multiple attempts")
        );
      },
      {
        service: "UserService",
        method: "verifyOTP",
      },
    );
  }

  /**
   * Get the currently signed-in user
   */
  static async getCurrentUser(
    context: "server" | "client" = "server",
  ): Promise<User> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const {
          data: { user },
          error,
        } = await client.auth.getUser();

        if (error) throw error;
        if (!user) throw new Error("No user found");

        return user;
      },
      {
        service: "UserService",
        method: "getCurrentUser",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<{ url: string }> {
    const client = await this.getClient("client"); // OAuth must be client-side
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_CALLBACK}`,
      },
    });
    if (error) throw error;
    if (!data.url) throw new Error("No redirect URL returned from OAuth");
    return { url: data.url };
  }

  /**
   * Sign out the current user
   */
  static async signOut(context: "server" | "client" = "client"): Promise<void> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);
        const { error } = await client.auth.signOut();

        if (error) throw error;
      },
      {
        service: "UserService",
        method: "signOut",
        userId: userId || undefined,
      },
    );
  }

  // ==========================================
  // Profile - User data operations
  // ==========================================

  /**
   * Update user profile information
   */
  static async updateProfile(
    data: ProfileData,
    context: "server" | "client" = "server",
  ): Promise<User> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        // Update auth metadata
        const updateData: any = {};
        if (data.fullName) updateData.full_name = data.fullName;
        if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;

        const {
          data: { user },
          error,
        } = await client.auth.updateUser({
          data: updateData,
        });

        if (error) throw error;
        if (!user) throw new Error("Failed to update user profile");

        return user;
      },
      {
        service: "UserService",
        method: "updateProfile",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Upload and set new avatar image
   */
  static async uploadAvatar(
    file: File,
    context: "server" | "client" = "client",
  ): Promise<string> {
    const userId = await this.getCurrentUserId(context);

    return this.execute(
      async () => {
        const client = await this.getClient(context);

        if (!userId) throw new Error("User not authenticated");

        // Upload to Supabase storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/avatar.${fileExt}`;

        const { data: uploadData, error: uploadError } = await client.storage
          .from("avatars")
          .upload(fileName, file, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = client.storage.from("avatars").getPublicUrl(fileName);

        // Update user profile with new avatar URL
        await this.updateProfile({ avatarUrl: publicUrl }, context);

        return publicUrl;
      },
      {
        service: "UserService",
        method: "uploadAvatar",
        userId: userId || undefined,
      },
    );
  }

  /**
   * Delete user account and all associated data
   */
  static async deleteAccount(
    userId: string,
    context: "server" = "server",
  ): Promise<void> {
    return this.execute(
      async () => {
        // Use admin client for privileged operations
        const adminClient = this.getAdminClient();

        if (!userId) throw new Error("User ID is required");

        // Delete all related data in the correct order
        try {
          // 1. Delete any other related data (add more tables as needed)
          // For example:
          // const { error: deleteOtherDataError } = await adminClient
          //   .from('other_table')
          //   .delete()
          //   .eq('user_id', userId);

          // 2. Delete the auth user
          const { error: deleteError } =
            await adminClient.auth.admin.deleteUser(userId, false);

          if (deleteError) {
            throw new Error(
              `Failed to delete auth user: ${deleteError.message}`,
            );
          }
        } catch (error) {
          throw new Error(
            `Error during deletion process: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      },
      {
        service: "UserService",
        method: "deleteAccount",
        userId: userId || undefined,
      },
    );
  }
}
