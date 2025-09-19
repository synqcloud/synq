"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@synq/ui/component";
import { Button } from "@synq/ui/component";
import { Input } from "@synq/ui/component";
import { toast } from "sonner";
import { UserService } from "@synq/supabase/services";
import { AvatarUpload } from "@/shared/avatar-upload";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.instanceof(File).optional(),
});

export function SetupAccountForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "" },
  });
  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 1. Update user profile using UserService
      await UserService.updateProfile(
        {
          fullName: values.fullName,
        },
        "client",
      );

      // 2. Upload avatar if provided
      if (values.avatar) {
        await UserService.uploadAvatar(values.avatar, "client");
      }

      // 3. Call your welcome email API
      await fetch("/api/mail/send-welcome", {
        method: "POST",
      });

      // Let the middleware handle the redirect based on whether the user has a provider profile
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <Card className="w-full max-w-md animate-in fade-in">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <CardTitle>Set up your account</CardTitle>
            <CardDescription className="mt-2">
              Add your name and profile picture
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AvatarUpload
                        value={field.value}
                        onChange={field.onChange}
                        size="xl"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                  <span>Saving changes...</span>
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
