"use client";

import React from "react";
import { CyclePaieDetailView } from "../components/CyclePaieDetailView";

interface Props {
  cycleId: string;
}

export default function CyclePaieDetailsPage({ cycleId }: Props) {
  return <CyclePaieDetailView cycleId={cycleId} />;
}
