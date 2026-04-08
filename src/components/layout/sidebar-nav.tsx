"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SYSTEM_DEFINITIONS } from "@/lib/system-config";
import { cn } from "@/lib/utils";

const baseLinks = [{ href: "/dashboard", label: "Dashboard" }];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 border-r border-slate-200 bg-[#f7faf9] p-4">
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blue Collar</p>
        <p className="text-lg font-semibold text-slate-900">Owner&apos;s Manual</p>
      </div>

      <nav className="space-y-1">
        {baseLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-[#1f4f46] text-white" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Systems</p>
        <nav className="space-y-1">
          {SYSTEM_DEFINITIONS.map((system) => {
            const href = `/systems/${system.slug}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={system.slug}
                href={href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-[#1f4f46] text-white" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {system.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <Link
          href="/settings/account"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/settings") ? "bg-[#1f4f46] text-white" : "text-slate-700 hover:bg-slate-100",
          )}
        >
          Settings
        </Link>
      </div>
    </aside>
  );
}
