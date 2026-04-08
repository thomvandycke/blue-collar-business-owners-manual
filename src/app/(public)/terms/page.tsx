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
              <h2 className="text-base font-semibold text-text-primary">1. Agreement to Terms</h2>
              <p>
                By accessing or using Blue Collar Business Owner&apos;s Manual (the &quot;Service&quot;), you agree to
                be bound by these Terms. If you do not agree, do not access or use the Service.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">2. Service Scope</h2>
              <p>
                Blue Collar Business Owner&apos;s Manual is a software platform provided by Unmatched Growth to help
                businesses manage operating systems, planning, and execution workflows.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">3. Account Responsibility</h2>
              <p>
                Account admins are responsible for user access, role assignments, data entered by team members, and
                keeping credentials secure. You agree not to share credentials with unauthorized users.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">4. Acceptable Use</h2>
              <p>
                You may not use the platform for unlawful activity, abuse, security testing without authorization, or
                content that violates applicable law. We may restrict access for abusive or unsafe behavior.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">5. Customer Data and License</h2>
              <p>
                You retain ownership of your business data. You grant Unmatched Growth a limited, revocable license to
                host, process, transmit, and back up data solely to provide and support the Service.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">6. Data and Availability</h2>
              <p>
                We aim for reliable service but do not guarantee uninterrupted availability. You are encouraged to export
                or retain critical business records as part of your own continuity practices.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">7. Security and Incident Response</h2>
              <p>
                We apply commercially reasonable safeguards appropriate to an MVP SaaS service. You acknowledge no system
                is perfectly secure. You are responsible for account-level security controls in your organization.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">8. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest extent permitted by
                law, Unmatched Growth disclaims all warranties, express or implied, including merchantability, fitness for
                a particular purpose, and non-infringement.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">9. Limitation of Liability</h2>
              <p>
                To the maximum extent allowed by law, Unmatched Growth will not be liable for indirect, incidental,
                special, consequential, or punitive damages, loss of profits, loss of data, or business interruption.
                Total liability arising from the Service will not exceed the fees paid by your account in the twelve (12)
                months preceding the claim (or $100 if no fees were paid).
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">10. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Unmatched Growth from claims, liabilities, and expenses
                arising from your use of the Service, your data, or your violation of these Terms.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">11. Suspension and Termination</h2>
              <p>
                We may suspend or terminate access for material violations, security risk, abuse, non-payment (if
                applicable), or legal necessity. Termination does not relieve obligations that by nature survive
                termination.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">12. Governing Law and Venue</h2>
              <p>
                These Terms are governed by applicable laws in the jurisdiction of Unmatched Growth operations, without
                regard to conflict-of-law rules. You agree to resolve disputes in the courts of competent jurisdiction in
                that region unless otherwise required by law.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">13. Changes to Terms</h2>
              <p>
                We may update these terms to reflect legal, security, or product changes. Continued use after updates
                constitutes acceptance of the revised terms.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">14. Contact</h2>
              <p>
                Questions about these terms can be sent to{" "}
                <a href="mailto:thom@unmatchedgrowth.com" className="text-accent-primary hover:underline">
                  thom@unmatchedgrowth.com
                </a>
                .
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">15. Legal Review Note</h2>
              <p>
                This policy is a strong operational baseline for the product but does not replace legal counsel. We
                recommend review by qualified counsel for jurisdiction-specific enforceability and compliance.
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
