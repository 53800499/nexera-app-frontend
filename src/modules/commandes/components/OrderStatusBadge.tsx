import type { OrderStatus } from "../types/order.types";
import {
  ORDER_STATUS_CLASSES,
  orderStatusLabel,
} from "../utils/orderLabels";

type Props = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_CLASSES[status]}`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
