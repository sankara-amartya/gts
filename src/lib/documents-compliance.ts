import type { CandidateDocumentRecord } from "@/lib/definitions";

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((expiry.getTime() - now.getTime()) / msPerDay);
}

export function getExpiryBadge(expiryDate?: string, reminderWindowDays = 30) {
  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft === null) {
    return { label: "No Expiry", variant: "outline" as const };
  }

  if (daysLeft < 0) {
    return { label: "Expired", variant: "destructive" as const };
  }

  if (daysLeft <= reminderWindowDays) {
    return { label: `Expiring in ${daysLeft}d`, variant: "outline" as const };
  }

  return { label: `Valid (${daysLeft}d)`, variant: "secondary" as const };
}

export function getCandidateComplianceStatus(documents: CandidateDocumentRecord[]) {
  if (documents.some((doc) => doc.status === "Missing" || doc.status === "Rejected")) {
    return "Non-Compliant" as const;
  }

  const hasExpiringSoon = documents.some((doc) => {
    const daysLeft = getDaysUntilExpiry(doc.expiryDate);
    const window = doc.reminderWindowDays ?? 30;
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= window;
  });

  if (hasExpiringSoon || documents.some((doc) => doc.status === "Submitted")) {
    return "At Risk" as const;
  }

  return "Compliant" as const;
}
