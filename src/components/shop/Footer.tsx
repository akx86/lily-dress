import Link from "next/link";
import { getSettings } from "@/actions/settings.actions";

export async function Footer() {
  const settingsResult = await getSettings();
  const facebookLink = settingsResult.success
    ? settingsResult.data.facebookLink
    : null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-8 md:px-16 lg:px-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
          <Link href="/login" className="cursor-text" title="">
            © {currentYear}
          </Link>{" "}
          Lily Dress. All rights reserved.
        </p>

        {facebookLink && (
          <a
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-zinc-900 sm:text-xs"
          >
            facebook
          </a>
        )}
      </div>
    </footer>
  );
}
