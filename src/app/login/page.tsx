/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const supabase = createClient();
    try {
      setIsAuthenticating(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw new Error("Invalid email or password.");
      }

      toast.success("Welcome back to Lily Admin.");

      // توجيه الأدمن للوحة التحكم بعد تسجيل الدخول بنجاح
      router.push("/dresses");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <LockIcon className="h-5 w-5 text-zinc-900" />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-normal tracking-wide text-zinc-900">
            Lily Admin
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
            Authorized Access Only
          </p>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@lilydress.com"
                        disabled={isAuthenticating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isAuthenticating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAuthenticating ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
