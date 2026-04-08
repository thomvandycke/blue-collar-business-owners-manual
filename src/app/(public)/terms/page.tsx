import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Terms &amp; Conditions</CardTitle>
            <p className="text-sm text-text-muted">Last updated: April 8, 2026</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">1. Service Scope</h2>
              <p>
                Blue Collar Business Owner&apos;s Manual is a software platform provided by Unmatched Growth to help
                businesses manage operating systems, planning, and execution workflows.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">2. Account Responsibility</h2>
              <p>
                Account admins are responsible for user access, role assignments, data entered by team members, and
                keeping credentials secure. You agree not to share credentials with unauthorized users.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">3. Acceptable Use</h2>
              <p>
                You may not use the platform for unlawful activity, abuse, security testing without authorization, or
                content that violates applicable law. We may restrict access for abusive or unsafe behavior.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">4. Data and Availability</h2>
              <p>
                We aim for reliable service but do not guarantee uninterrupted availability. You are encouraged to export
                or retain critical business records as part of your own continuity practices.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">5. Limitation of Liability</h2>
              <p>
                To the maximum extent allowed by law, the service is provided on an as-is basis. Unmatched Growth is not
                liable for indirect, incidental, or consequential damages resulting from use or inability to use the
                platform.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">6. Changes to Terms</h2>
              <p>
                We may update these terms to reflect legal, security, or product changes. Continued use after updates
                constitutes acceptance of the revised terms.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">7. Contact</h2>
              <p>
                Questions about these terms can be sent to{" "}
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

