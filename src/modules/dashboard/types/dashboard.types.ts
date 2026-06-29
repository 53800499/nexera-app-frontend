export type DashboardPeriod = {
  from: string;
  to: string;
};

export type RevenueKpi = {
  revenueHt: number;
  variationPercent?: number | null;
  previousPeriodRevenueHt: number;
};

export type TopClient = {
  clientId: string;
  clientName: string;
  revenueHt: number;
  invoiceCount: number;
};

export type TopArticle = {
  itemId?: string | null;
  label: string;
  revenueHt: number;
  quantity: number;
};

export type AgedBalanceBucket = {
  label: string;
  amountTtc: number;
  invoiceCount: number;
};

export type UpcomingDueInvoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  amountDue: number;
  daysUntilDue: number;
};

export type CommercialDashboard = {
  period: DashboardPeriod;
  revenue: RevenueKpi;
  issuedInvoiceCount: number;
  totalOverdueAmountTtc: number;
  quotationConversionRate: number | null;
  topClients: TopClient[];
  topArticles: TopArticle[];
  agedBalance: AgedBalanceBucket[];
  upcomingDueInvoices: UpcomingDueInvoice[];
};

export type DashboardQueryParams = {
  from?: string;
  to?: string;
};
