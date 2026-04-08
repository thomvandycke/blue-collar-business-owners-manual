import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopHeader } from "@/components/layout/top-header";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authContext = await requireUser();

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <SidebarNav userRole={authContext.user.role} userEmail={authContext.user.email} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopHeader
          accountName={authContext.account.name}
          accountLogoUrl={authContext.account.logoUrl}
          userName={authContext.user.displayName}
          userImage={authContext.user.profileImageUrl}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
        <footer className="border-t border-border-subtle px-6 py-3 text-xs text-text-muted lg:px-8">
          © 2026 Unmatched Growth
        </footer>
      </div>
    </div>
  );
}
