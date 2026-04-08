import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Statement</CardTitle>
            <p className="text-sm text-text-muted">Last updated: April 8, 2026</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">1. Information We Collect</h2>
              <p>
                We collect account profile data (name, email, display name, role), authentication and session data,
                business operating data entered in the app (systems, KPIs, goals, tasks, notes), and basic activity logs
                required for security, compliance, and product operation.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">2. How We Use Information</h2>
              <p>
                Data is used to deliver the service, authenticate users, enforce permissions, provide account management,
                support troubleshooting, and protect against unauthorized access and abuse.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">3. Data Sharing</h2>
              <p>
                We do not sell personal information. Data may be processed by infrastructure providers required to run the
                application (hosting, database, email). We share only what is necessary to provide the service.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">4. Security</h2>
              <p>
                We implement role-based access, password hashing, secure sessions, and production controls appropriate for
                an MVP SaaS environment. No system can be guaranteed fully secure, so users should use strong passwords and
                limit account access to trusted personnel.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">5. Data Retention</h2>
              <p>
                Account and business records are retained while the account is active. Some records (for example, activity
                logs) may remain for audit/history purposes. User deactivation may preserve historical references to protect
                record integrity.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">6. Your Choices</h2>
              <p>
                Admins can update account branding and user status. Users can update display name, profile image, and
                password. To request account-level data export or deletion, contact Unmatched Growth support.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">7. Contact</h2>
              <p>
                Privacy questions can be sent to{" "}
                <a href="mailto:thom@unmatchedgrowth.com" className="text-accent-primary hover:underline">
                  thom@unmatchedgrowth.com
                </a>
                .
              </p>
            </section>
          </CardContent>
        </Card>
        <p className="text-sm text-text-muted">
          Return to{" "}
          <Link href="/login" className="text-accent-primary hover:underline">
            Login
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

