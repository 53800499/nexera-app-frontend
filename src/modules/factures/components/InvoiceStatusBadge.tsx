import type { InvoiceStatus } from "../types/invoice.types";
import {
  INVOICE_STATUS_CLASSES,
  invoiceStatusLabel,
} from "../utils/invoiceLabels";

type Props = {
  status: InvoiceStatus;
};

export function InvoiceStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_STATUS_CLASSES[status]}`}
    >
      {invoiceStatusLabel(status)}
    </span>
  );
}
