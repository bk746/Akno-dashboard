"use client";

import type { ComponentProps } from "react";
import { QuoteDocument } from "@/components/devis/quote-document";
import { QuotePdfStyles } from "@/components/devis/quote-pdf-styles";
import { PdfDownloadButton } from "@/components/ui/pdf-download-button";
import { downloadQuotePdf } from "@/lib/download-quote-pdf";

type QuotePdfPanelProps = {
  quote: ComponentProps<typeof QuoteDocument>["quote"];
  title?: string;
  actions?: React.ReactNode;
};

export function QuotePdfPanel({ quote, title, actions }: QuotePdfPanelProps) {
  return (
    <div className="space-y-4">
      <QuotePdfStyles />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neu-text">
            {title ?? `Devis ${quote.number}`}
          </p>
          <p className="mt-0.5 text-xs text-neu-muted">
            Aperçu prêt à l&apos;export — format A4
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <PdfDownloadButton
            onDownload={() => downloadQuotePdf(`Devis-${quote.number}`)}
          />
        </div>
      </div>

      <div className="akno-pdf-preview-frame overflow-hidden rounded-2xl border border-akno-border bg-white shadow-[0_8px_30px_rgba(10,37,64,0.06)]">
        <div className="max-h-[min(72vh,900px)] overflow-y-auto overscroll-contain bg-[#f8fafc] p-3 sm:p-5">
          <div style={{ padding: "36px 40px" }}>
            <QuoteDocument quote={quote} />
          </div>
        </div>
      </div>
    </div>
  );
}
