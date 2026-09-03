import { PDF_DOCUMENT_CSS } from "@/lib/pdf-document-styles";

export function QuotePdfStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PDF_DOCUMENT_CSS }} />;
}
