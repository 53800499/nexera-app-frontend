export type HelpCategoryKey =
  | "fiscalite"
  | "facturation"
  | "paie"
  | "frais"
  | "stock"
  | "crm"
  | "cabinet"
  | "rapports"
  | "comptabilite"
  | "demarrage";

export interface HelpStep {
  title: string;
  content: string;
}

export interface HelpFaqItem {
  q: string;
  a: string;
}

export interface HelpArticle {
  id: string;
  chapterNumber?: string;
  title: string;
  category: HelpCategoryKey;
  categoryLabel: string;
  route?: string;
  legalRef?: string;
  summary: string;
  readTime: string;
  steps: HelpStep[];
  tips?: string;
  warning?: string;
  faq?: HelpFaqItem[];
  tags: string[];
}

export interface ContextualHelpMapping {
  routePrefix: string;
  articleId: string;
  relatedArticleIds?: string[];
}
