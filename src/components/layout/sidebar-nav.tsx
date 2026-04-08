"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  BriefcaseBusiness,
  Cog,
  HandCoins,
  Handshake,
  Headset,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import { canAccessUserAdminArea } from "@/lib/admin-access";
import { SYSTEM_DEFINITIONS } from "@/lib/system-config";
import { cn } from "@/lib/utils";

const baseLinks = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];

const systemIcons: Record<string, LucideIcon> = {
  marketing: Megaphone,
  sales: HandCoins,
  partnerships: Handshake,
  operations: Wrench,
  "customer-service": Headset,
  finance: Wallet,
  people: Users,
  leadership: BriefcaseBusiness,
};

type SidebarNavProps = {
  userRole: UserRole;
  userEmail: string;
};

export function SidebarNav({ userRole, userEmail }: SidebarNavProps) {
  const pathname = usePathname();
  const canAccessAdminUsers = userRole === UserRole.ADMIN && canAccessUserAdminArea(userEmail);

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 border-r border-border-subtle bg-bg-secondary p-4">
      <div className="mb-6 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-mark-orange-trans-bg.png"
            alt="Unmatched Growth mark"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            priority
          />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted">Unmatched Growth</p>
            <p className="text-sm font-semibold text-text-primary">Owner&apos;s Manual</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {baseLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-accent-soft text-accent-primary"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Systems</p>
        <nav className="space-y-1">
          {SYSTEM_DEFINITIONS.map((system) => {
            const href = `/systems/${system.slug}`;
            const active = pathname.startsWith(href);
            const Icon = systemIcons[system.slug] ?? BriefcaseBusiness;
            return (
              <Link
                key={system.slug}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-accent-soft text-accent-primary"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                {system.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 border-t border-border-subtle pt-4">
        <Link
          href="/settings/account"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            pathname.startsWith("/settings")
              ? "bg-accent-soft text-accent-primary"
              : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
          )}
        >
          <Cog className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/support"
          className={cn(
            "mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            pathname.startsWith("/support")
              ? "bg-accent-soft text-accent-primary"
              : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
          )}
        >
          <LifeBuoy className="h-4 w-4" />
          Help
        </Link>
        {canAccessAdminUsers ? (
          <Link
            href="/settings/users"
            className={cn(
              "mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
              pathname.startsWith("/settings/users")
                ? "bg-accent-soft text-accent-primary"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
            )}
          >
            <Users className="h-4 w-4" />
            Admin Users
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
