import { downloadDocumentPdf } from "@/lib/download-pdf";

export async function downloadQuotePdf(
  filename: string,
  elementId = "quote-document",
): Promise<void> {
  await downloadDocumentPdf(filename, elementId);
}
