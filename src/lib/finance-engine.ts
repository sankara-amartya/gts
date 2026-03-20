import {
  billingProfiles,
  candidates,
  clients,
  dunningCases,
  invoices,
  receipts,
  reconciliationRecords,
  refunds,
  transactions,
} from "@/lib/data";
import type {
  BillingModel,
  BillingProfile,
  DunningCase,
  Invoice,
  InvoiceLineItem,
  PaymentMethod,
  Receipt,
  ReconciliationRecord,
  Refund,
  Transaction,
} from "@/lib/definitions";

function nowIso() {
  return new Date().toISOString();
}

function addDays(isoDate: string, days: number) {
  const value = new Date(isoDate);
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

export function getPartyName(payerType: "Candidate" | "Employer", payerId: string) {
  if (payerType === "Candidate") {
    return candidates.find((candidate) => candidate.id === payerId)?.name ?? "Unknown Candidate";
  }

  return clients.find((client) => client.id === payerId)?.name ?? "Unknown Employer";
}

export function getInvoiceTotal(invoice: Invoice) {
  return invoice.lineItems.reduce((sum, line) => {
    const base = line.quantity * line.unitAmount;
    const tax = base * (line.taxPercent / 100);
    return sum + base + tax - line.discountAmount;
  }, 0);
}

export function getInvoicePaidAmount(invoiceId: string) {
  return receipts
    .filter((receipt) => receipt.status === "Captured")
    .flatMap((receipt) => receipt.allocations)
    .filter((allocation) => allocation.invoiceId === invoiceId)
    .reduce((sum, allocation) => sum + allocation.amount, 0);
}

export function getInvoiceRefundedAmount(invoiceId: string) {
  return refunds
    .filter((refund) => refund.invoiceId === invoiceId && refund.status === "Processed")
    .reduce((sum, refund) => sum + refund.amount, 0);
}

export function getInvoiceOutstanding(invoiceId: string) {
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return 0;
  }

  const total = getInvoiceTotal(invoice);
  const paid = getInvoicePaidAmount(invoiceId);
  const refunded = getInvoiceRefundedAmount(invoiceId);
  return Math.max(total - paid + refunded, 0);
}

function recomputeInvoiceStatus(invoiceId: string) {
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice || invoice.status === "Cancelled") {
    return;
  }

  const total = getInvoiceTotal(invoice);
  const paid = getInvoicePaidAmount(invoiceId);
  const dueDate = new Date(invoice.dueAt);
  const current = new Date();

  if (paid >= total) {
    invoice.status = "Paid";
    return;
  }

  if (paid > 0) {
    invoice.status = "Partially Paid";
    return;
  }

  if (invoice.status !== "Draft" && dueDate < current) {
    invoice.status = "Overdue";
    return;
  }

  if (invoice.status !== "Draft") {
    invoice.status = "Sent";
  }
}

export function createBillingProfile(input: {
  candidateId: string;
  mandateId: string;
  model: BillingModel;
  currency: Transaction["currency"];
  splitType?: BillingProfile["splitType"];
  candidateShare?: number;
  employerShare?: number;
  notes?: string;
}) {
  const profile: BillingProfile = {
    id: `bp-${billingProfiles.length + 1}`,
    candidateId: input.candidateId,
    mandateId: input.mandateId,
    model: input.model,
    baseCurrency: input.currency,
    splitType: input.splitType,
    candidateShare: input.candidateShare,
    employerShare: input.employerShare,
    notes: input.notes,
    createdAt: nowIso(),
  };

  billingProfiles.unshift(profile);
  return profile;
}

export function createInvoice(input: {
  payerType: Invoice["payerType"];
  payerId: string;
  currency: Invoice["currency"];
  dueInDays: number;
  candidateId?: string;
  mandateId?: string;
  description: string;
  amount: number;
}) {
  const issuedAt = nowIso();
  const nextSequence = invoices.length + 1;

  const lineItem: InvoiceLineItem = {
    id: `ili-${Date.now()}`,
    description: input.description,
    quantity: 1,
    unitAmount: input.amount,
    taxPercent: 0,
    discountAmount: 0,
  };

  const invoice: Invoice = {
    id: `inv-${nextSequence}`,
    invoiceNumber: `INV-2026-${String(nextSequence).padStart(4, "0")}`,
    payerType: input.payerType,
    payerId: input.payerId,
    currency: input.currency,
    issuedAt,
    dueAt: addDays(issuedAt, input.dueInDays),
    status: "Draft",
    candidateId: input.candidateId,
    mandateId: input.mandateId,
    lineItems: [lineItem],
  };

  invoices.unshift(invoice);
  return invoice;
}

export function sendInvoice(invoiceId: string) {
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice || invoice.status === "Cancelled") {
    return null;
  }

  if (invoice.status === "Draft") {
    invoice.status = "Sent";
  }

  recomputeInvoiceStatus(invoiceId);
  return invoice;
}

export function recordReceipt(input: {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}) {
  const invoice = invoices.find((item) => item.id === input.invoiceId);
  if (!invoice) {
    return { ok: false as const, error: "Invoice not found." };
  }

  if (input.amount <= 0) {
    return { ok: false as const, error: "Amount must be positive." };
  }

  const receiptNumber = `RCP-2026-${String(receipts.length + 1).padStart(4, "0")}`;
  const receipt: Receipt = {
    id: `rcp-${receipts.length + 1}`,
    receiptNumber,
    payerType: invoice.payerType,
    payerId: invoice.payerId,
    currency: invoice.currency,
    amount: input.amount,
    method: input.method,
    gatewayReference: input.method === "Gateway" ? input.reference : undefined,
    bankReference: input.method === "Bank Transfer" ? input.reference : undefined,
    receivedAt: nowIso(),
    status: "Captured",
    allocations: [{ invoiceId: invoice.id, amount: input.amount }],
  };

  receipts.unshift(receipt);
  transactions.unshift({
    id: `txn-${transactions.length + 1}`,
    amount: input.amount,
    currency: invoice.currency,
    payerType: invoice.payerType,
    payerId: invoice.payerId,
    description: `Receipt ${receiptNumber} for ${invoice.invoiceNumber}`,
    status: "Paid",
    createdAt: receipt.receivedAt,
  });

  recomputeInvoiceStatus(invoice.id);
  return { ok: true as const, receipt };
}

export function issueRefund(input: { invoiceId: string; amount: number; reason: string }) {
  const invoice = invoices.find((item) => item.id === input.invoiceId);
  if (!invoice) {
    return { ok: false as const, error: "Invoice not found." };
  }

  const paidAmount = getInvoicePaidAmount(invoice.id);
  if (input.amount <= 0 || input.amount > paidAmount) {
    return { ok: false as const, error: "Refund amount exceeds captured receipts." };
  }

  const receiptForInvoice = receipts.find((receipt) =>
    receipt.allocations.some((allocation) => allocation.invoiceId === invoice.id)
  );

  const refund: Refund = {
    id: `rfd-${refunds.length + 1}`,
    refundNumber: `RFD-2026-${String(refunds.length + 1).padStart(4, "0")}`,
    invoiceId: invoice.id,
    receiptId: receiptForInvoice?.id,
    payerType: invoice.payerType,
    payerId: invoice.payerId,
    currency: invoice.currency,
    amount: input.amount,
    reason: input.reason,
    status: "Processed",
    createdAt: nowIso(),
    processedAt: nowIso(),
  };

  refunds.unshift(refund);
  transactions.unshift({
    id: `txn-${transactions.length + 1}`,
    amount: input.amount,
    currency: invoice.currency,
    payerType: invoice.payerType,
    payerId: invoice.payerId,
    description: `Refund ${refund.refundNumber} for ${invoice.invoiceNumber}`,
    status: "Refunded",
    createdAt: refund.createdAt,
  });

  recomputeInvoiceStatus(invoice.id);
  return { ok: true as const, refund };
}

export function reconcileReceipt(receiptId: string, statementAmount: number, bankReference: string) {
  const receipt = receipts.find((item) => item.id === receiptId);
  if (!receipt) {
    return { ok: false as const, error: "Receipt not found." };
  }

  const difference = Number((statementAmount - receipt.amount).toFixed(2));
  const status = difference === 0 ? "Matched" : Math.abs(difference) <= 5 ? "Unmatched" : "Exception";

  const existing = reconciliationRecords.find((record) => record.receiptId === receiptId);
  const payload: ReconciliationRecord = {
    id: existing?.id ?? `rec-${reconciliationRecords.length + 1}`,
    receiptId,
    bankReference,
    statementAmount,
    statementDate: nowIso(),
    status,
    differenceAmount: difference,
    note: difference === 0 ? "Auto-matched" : "Needs manual finance review",
  };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    reconciliationRecords.unshift(payload);
  }

  return { ok: true as const, record: payload };
}

export function runDunningCycle() {
  const now = new Date();
  const escalated: DunningCase[] = [];

  for (const invoice of invoices) {
    const outstanding = getInvoiceOutstanding(invoice.id);
    if (outstanding <= 0) {
      continue;
    }

    const dueDate = new Date(invoice.dueAt);
    const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    if (overdueDays <= 0) {
      continue;
    }

    const existing = dunningCases.find((item) => item.invoiceId === invoice.id && item.status !== "Resolved");
    const stage = overdueDays >= 21 ? "Escalated" : overdueDays >= 14 ? "Final Notice" : overdueDays >= 7 ? "Warning" : "Friendly Reminder";

    if (existing) {
      existing.stage = stage;
      existing.status = "Sent";
      existing.lastSentAt = nowIso();
      existing.nextActionAt = addDays(nowIso(), 3);
      existing.attemptCount += 1;
      escalated.push(existing);
      continue;
    }

    const created: DunningCase = {
      id: `dun-${dunningCases.length + 1}`,
      invoiceId: invoice.id,
      payerType: invoice.payerType,
      payerId: invoice.payerId,
      stage,
      status: "Sent",
      nextActionAt: addDays(nowIso(), 3),
      lastSentAt: nowIso(),
      attemptCount: 1,
    };

    dunningCases.unshift(created);
    escalated.push(created);
  }

  return escalated;
}

export function getFinanceSummary() {
  const totalReceivable = invoices.reduce((sum, invoice) => sum + getInvoiceTotal(invoice), 0);
  const totalOutstanding = invoices.reduce((sum, invoice) => sum + getInvoiceOutstanding(invoice.id), 0);
  const totalCaptured = receipts.filter((receipt) => receipt.status === "Captured").reduce((sum, receipt) => sum + receipt.amount, 0);
  const totalRefunded = refunds.filter((refund) => refund.status === "Processed").reduce((sum, refund) => sum + refund.amount, 0);

  return {
    totalReceivable,
    totalOutstanding,
    totalCaptured,
    totalRefunded,
    overdueCount: invoices.filter((invoice) => invoice.status === "Overdue").length,
    dunningOpen: dunningCases.filter((item) => item.status !== "Resolved").length,
  };
}
