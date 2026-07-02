export function openPdfBlob(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function downloadPdfBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

export function createPdfPreviewUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

export function revokePdfPreviewUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}
