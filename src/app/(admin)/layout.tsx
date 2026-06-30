"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGridIcon,
  SettingsIcon,
  TagsIcon,
  StoreIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dresses", href: "/dresses", icon: LayoutGridIcon },
  { name: "Categories", href: "/categories", icon: TagsIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // pb-20 في الموبايل عشان المحتوى ميتغطاش بالشريط السفلي، و pl-64 للديسكتوب عشان مساحة الـ Sidebar
    <div className="min-h-screen bg-zinc-50/50 pb-20 md:pb-0 md:pl-64">
      {/* 1. Desktop Sidebar (يختفي في الموبايل) */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-white md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-serif text-lg font-semibold tracking-wide text-zinc-900">
            Lily Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-zinc-900" : "text-zinc-400",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <StoreIcon className="h-4 w-4 text-zinc-400" />
            View Storefront
          </Link>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation (يختفي في الديسكتوب) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-white/95 pb-safe backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1.5 px-2",
                isActive
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-zinc-900" : "text-zinc-400",
                )}
              />
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          );
        })}
        {/* زرار العودة للمتجر في الموبايل */}
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 text-zinc-400 hover:text-zinc-600"
        >
          <StoreIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-wide">Store</span>
        </Link>
      </nav>

      {/* 3. Main Content (المحتوى المتغير) */}
      <main className="w-full">{children}</main>
    </div>
  );
}
