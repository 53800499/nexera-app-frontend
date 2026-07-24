/**
 * RM-E01 — format : [CODE_ENTREPÔT]-[ZONE]-[ALLÉE]-[RAYON]-[CASE]
 */
export function buildLocationCodePreview(parts: {
  warehouseCode: string;
  zone: string;
  aisle: string;
  rack: string;
  bin: string;
}): string {
  const normalize = (value: string) => value.trim().toUpperCase();
  const segments = [
    normalize(parts.warehouseCode),
    normalize(parts.zone),
    normalize(parts.aisle),
    normalize(parts.rack),
    normalize(parts.bin),
  ];
  if (segments.some((s) => !s)) return "";
  return segments.join("-");
}
