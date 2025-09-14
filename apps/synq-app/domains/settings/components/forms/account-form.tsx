"use client";

// REACT
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

// FORM
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// API
import { UserService } from "@synq/supabase/services";

// UI COMPONENTS
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Button,
  Input,
} from "@synq/ui/component";

// SHARED COMPONENTS
import { Save } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { AvatarUpload } from "@/shared/avatar-upload";
import { Spinner } from "@synq/ui/component";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const accountFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(30),
  email: z.string().email(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

type AccountFormProps = {
  initialData?: Partial<AccountFormValues> & { avatar_url?: string };
};

export function AccountForm({ initialData }: AccountFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const {
    file: avatarFile,
    preview: avatarPreview,
    handleFileChange,
    resetFile,
  } = useFileUpload({
    initialPreview: initialData?.avatar_url,
    maxSize: 5 * 1024 * 1024, // 5MB
    validTypes: ["image/jpeg", "image/png", "image/gif"],
  });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
    },
  });

  const onSubmit = useCallback(
    async (data: AccountFormValues) => {
      try {
        setIsSubmitting(true);

        await UserService.updateProfile({ fullName: data.name }, "client");

        if (avatarFile) {
          await UserService.uploadAvatar(avatarFile, "client");
        }

        queryClient.invalidateQueries({ queryKey: ["currentUser"] });

        toast.success("Profile updated successfully");
        resetFile();

        router.refresh(); // optional if you still want a route refresh
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update profile",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [avatarFile, resetFile, router, queryClient],
  );

  const handleAvatarChange = useCallback(
    (file: File | undefined) => {
      if (file) {
        handleFileChange(file);
      }
    },
    [handleFileChange],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <div className="flex flex-col items-center gap-4">
            <AvatarUpload
              value={avatarFile || avatarPreview}
              onChange={handleAvatarChange}
              size="xl"
            />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Profile Picture</p>
              <p className="text-sm text-muted-foreground">
                Square image, max 5MB
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input
                    {...field}
                    placeholder="Your name"
                    className="max-w-md"
                  />
                  <FormDescription>
                    Display name for your profile and emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} readOnly className="max-w-md" />
                  <FormDescription>Contact email (read-only)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] gap-2"
          >
            {isSubmitting ? <Spinner /> : <Save className="w-4 h-4" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
