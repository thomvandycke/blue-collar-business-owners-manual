const ADMIN_EMAIL_ALLOWLIST = new Set([
  "thom@unmatchedgrowth.com",
  "brad@unmatchedgrowth.com",
]);

export function canAccessUserAdminArea(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}

