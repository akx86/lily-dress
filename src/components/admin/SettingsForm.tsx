"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { StoreSettingsData } from "@/actions/settings.actions";
import { updateSettings } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      {
        message: "Enter a valid phone number with country code (10–15 digits).",
      },
    ),
  facebookLink: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/.test(value), {
      message: "Enter a valid URL starting with http:// or https://.",
    }),
  heroMessage: z.string().trim().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type SettingsFormProps = {
  settings: StoreSettingsData;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: settings.whatsappNumber ?? "",
      facebookLink: settings.facebookLink ?? "",
      heroMessage: settings.heroMessage ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: SettingsFormValues) {
    // السينيور تاتش: تنظيف رقم الواتساب من أي مسافات أو حروف قبل الحفظ
    const cleanWhatsapp = values.whatsappNumber
      ? values.whatsappNumber.replace(/[^0-9+]/g, "")
      : null;

    const result = await updateSettings({
      whatsappNumber: cleanWhatsapp,
      facebookLink: values.facebookLink || null,
      heroMessage: values.heroMessage || null,
    });

    if (result.success) {
      toast.success("Settings saved successfully.");
      router.refresh();
      return;
    }

    toast.error(result.error);
  }

  return (
    <Form {...form}>
      {/* وضع الفورم داخل Card Layout لزيادة الفخامة والترتيب */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+201000000000"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include country code. Spaces will be formatted automatically.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebookLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>facebook Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://facebook.com/lilydress"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heroMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A short welcome message for the storefront..."
                    className="min-h-24 resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This message appears at the top of the customer catalog.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8 flex justify-end border-t border-border pt-6">
          {/* Mobile-First Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
