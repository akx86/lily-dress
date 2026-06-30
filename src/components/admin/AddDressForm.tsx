/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DressStatus } from "@prisma/client";
import { Loader2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addDress } from "@/actions/dress.actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
const DRESS_STATUS_OPTIONS = ["AVAILABLE", "RENTED", "MAINTENANCE"] as const;
const addDressSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  description: z.string().trim().min(1, "Description is required."),
  size: z.string().trim().min(1, "Size is required."),
  color: z.string().trim().min(1, "Color is required."),
  status: z.enum(DRESS_STATUS_OPTIONS, { message: "Status is required." }),
  categoryId: z.string().trim().min(1, "Category is required."),
});

type AddDressFormValues = z.infer<typeof addDressSchema>;

type CategoryOption = { id: string; name: string };
type AddDressFormProps = {
  categories: CategoryOption[];
  onSuccess?: () => void;
};

const statusLabels: Record<DressStatus, string> = {
  AVAILABLE: "Available",
  RENTED: "Rented",
  MAINTENANCE: "Maintenance",
};

export function AddDressForm({ categories, onSuccess }: AddDressFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<AddDressFormValues>({
    resolver: zodResolver(addDressSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      size: "",
      color: "",
      status: "AVAILABLE",
      categoryId: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting || isUploading;

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFile(null);
    setPreviewUrl(null);
  };

  async function onSubmit(values: AddDressFormValues) {
    if (!file) {
      toast.error("Please upload an image for the dress.");
      return;
    }
    const supabase = createClient();

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("dresses")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        throw new Error(
          uploadError.message || "Image upload failed due to server policy.",
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("dresses")
        .getPublicUrl(fileName);

      const result = await addDress({
        ...values,
        imageUrl: publicUrlData.publicUrl,
      });

      if (result.success) {
        toast.success("Dress added successfully.");
        form.reset();
        setFile(null);
        setPreviewUrl(null);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      {/* تحويل الفورم لـ Flex Column عشان نقدر نفصل المحتوى عن الزرار */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {/* منطقة المحتوى القابلة للتمرير (Scrollable Content) */}
        {/* pr-2 بتدي مساحة صغيرة للـ Scrollbar عشان ميغطيش على أطراف الـ Inputs */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div className="space-y-2">
            <FormLabel>Dress Image</FormLabel>
            <div className="flex items-center justify-center w-full">
              {previewUrl ? (
                <div className="relative flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-zinc-200 bg-zinc-50 overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-zinc-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive hover:text-white"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <UploadCloudIcon className="mb-2 h-8 w-8 text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-500">
                      Click to upload high-quality image
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      if (selectedFile) {
                        setPreviewUrl(URL.createObjectURL(selectedFile));
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Luxury Evening Gown"
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="luxury-evening-gown"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-24 resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="M / 38"
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Royal Blue"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DRESS_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status as DressStatus]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* الزرار الثابت (Sticky Action Bar) */}
        {/* shrink-0 عشان نمنع الزرار إنه ينضغط لما الشاشة تصغر */}
        <div className="mt-4 shrink-0 border-t border-border pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && (
              <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Saving to Catalog..." : "Add Dress"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
