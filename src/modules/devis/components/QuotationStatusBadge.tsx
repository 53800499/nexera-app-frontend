import type { QuotationStatus } from "../types/quotation.types";
import {
  quotationStatusLabel,
  QUOTATION_STATUS_CLASSES,
} from "../utils/quotationLabels";

type Props = {
  status: QuotationStatus;
};

export function QuotationStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${QUOTATION_STATUS_CLASSES[status]}`}
    >
      {quotationStatusLabel(status)}
    </span>
  );
}
