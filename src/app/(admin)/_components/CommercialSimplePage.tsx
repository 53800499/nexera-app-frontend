import React from "react";
import CommercialPageShell from "./CommercialPageShell";

type Props = {
  title: string;
  description: string;
};

export default function CommercialSimplePage({ title, description }: Props) {
  return <CommercialPageShell title={title} description={description} />;
}
