import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopHeader } from "@/components/layout/top-header";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authContext = await requireUser();

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <SidebarNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopHeader
          accountName={authContext.account.name}
          accountLogoUrl={authContext.account.logoUrl}
          userName={authContext.user.displayName}
          userImage={authContext.user.profileImageUrl}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
