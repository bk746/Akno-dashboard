/** Styles PDF — hex/rgb, vraies tables HTML (fiable avec html2canvas). */
export const PDF_DOCUMENT_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }

.akno-pdf-document {
  position: relative;
  width: 714px;
  padding: 0;
  background: #ffffff;
  color: #0a2540;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 11px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.akno-pdf-watermark {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 500px;
  margin-left: -250px;
  text-align: center;
  pointer-events: none;
  font-size: 56px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(10, 37, 64, 0.05);
  transform: rotate(-24deg);
  z-index: 0;
  line-height: 1;
}

.akno-pdf-inner {
  position: relative;
  z-index: 1;
}

.akno-pdf-muted { color: #697386; }
.akno-pdf-accent { color: #635bff; }

.akno-pdf-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #697386;
  margin: 0 0 6px;
}

.akno-pdf-label-accent {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #635bff;
  margin: 0 0 6px;
}

.akno-pdf-body-text {
  font-size: 10.5px;
  line-height: 1.55;
  color: #0a2540;
  margin: 0;
  white-space: pre-line;
}

.akno-pdf-legal-text {
  font-size: 10px;
  line-height: 1.5;
  color: #697386;
  margin: 4px 0 0;
}

/* Tables structurelles */
.akno-pdf-layout-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.akno-pdf-layout-table td {
  vertical-align: top;
  padding: 0;
}

.akno-pdf-gap-col { width: 16px; }
.akno-pdf-gap-col-lg { width: 20px; }

/* En-tête */
.akno-pdf-header-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  text-align: right;
}

.akno-pdf-header-number {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  color: #635bff;
  margin: 6px 0 0;
  text-align: right;
}

.akno-pdf-header-logo {
  height: 36px;
  width: auto;
  display: block;
}

/* Meta bandeau */
.akno-pdf-meta {
  width: 100%;
  background: #f6f9fc;
  border-radius: 10px;
  margin: 20px 0 24px;
}

.akno-pdf-meta td {
  padding: 14px 16px;
  vertical-align: top;
}

.akno-pdf-meta-value {
  font-size: 11px;
  font-weight: 600;
  margin: 2px 0 0;
}

.akno-pdf-meta-total {
  font-size: 14px;
  font-weight: 700;
  color: #635bff;
  margin: 2px 0 0;
}

.akno-pdf-project-title {
  font-size: 21px;
  font-weight: 700;
  line-height: 1.25;
  margin: 6px 0 0;
}

.akno-pdf-project-sub {
  font-size: 11px;
  line-height: 1.5;
  color: #697386;
  margin: 8px 0 0;
}

/* Cartes De / Pour */
.akno-pdf-card {
  border: 1px solid #e3e8ee;
  border-radius: 10px;
  padding: 14px 16px;
}

.akno-pdf-card-client {
  border-color: #c4c0ff;
  background: #f6f5ff;
}

.akno-pdf-party-name {
  font-size: 13px;
  font-weight: 700;
  margin: 6px 0 0;
}

.akno-pdf-party-lines {
  font-size: 10.5px;
  line-height: 1.55;
  color: #697386;
  margin: 8px 0 0;
}

.akno-pdf-party-lines p { margin: 0 0 3px; }

/* Prestations */
.akno-pdf-section-head {
  border-bottom: 2px solid #0a2540;
  padding-bottom: 8px;
  margin: 24px 0 14px;
}

.akno-pdf-phase { margin-bottom: 18px; }

.akno-pdf-phase-name {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.akno-pdf-phase-desc {
  font-size: 10.5px;
  color: #697386;
  margin: 3px 0 0;
  line-height: 1.45;
}

.akno-pdf-phase-num {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #635bff;
  width: 28px;
  padding-right: 8px;
}

.akno-pdf-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-top: 8px;
}

.akno-pdf-items-table th {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #697386;
  font-weight: 600;
  padding: 0 0 6px;
  text-align: right;
  border-bottom: none;
}

.akno-pdf-items-table th:first-child { text-align: left; padding-left: 28px; }
.akno-pdf-items-table td {
  border-top: 1px solid #e3e8ee;
  padding: 8px 0;
  vertical-align: top;
}
.akno-pdf-items-table td:first-child { padding-left: 28px; padding-right: 10px; }
.akno-pdf-items-table .c-qty { width: 52px; text-align: right; color: #697386; }
.akno-pdf-items-table .c-price { width: 72px; text-align: right; color: #697386; }
.akno-pdf-items-table .c-total { width: 72px; text-align: right; font-weight: 600; }

.akno-pdf-line-title { font-weight: 500; line-height: 1.35; margin: 0; }
.akno-pdf-line-detail { font-size: 10px; color: #697386; margin: 3px 0 0; line-height: 1.4; }

.akno-pdf-options {
  border: 1px dashed #c2c9d6;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 16px 0;
}

/* Échéancier + récap */
.akno-pdf-schedule {
  border: 1px solid #e3e8ee;
  border-radius: 10px;
  padding: 14px 16px;
}

.akno-pdf-recap-box {
  background: #0a2540;
  border-radius: 10px;
  padding: 14px 16px;
  color: #ffffff;
}

.akno-pdf-pay-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.akno-pdf-pay-table td {
  vertical-align: top;
  padding: 0 0 12px;
}

.akno-pdf-pay-table tr + tr td {
  border-top: 1px solid #e3e8ee;
  padding-top: 12px;
}

.akno-pdf-pay-title { font-weight: 600; margin: 0 0 3px; line-height: 1.35; }
.akno-pdf-pay-sub { font-size: 10px; color: #697386; margin: 0; line-height: 1.4; }
.akno-pdf-pay-amt { text-align: right; font-weight: 700; white-space: nowrap; width: 80px; padding-left: 10px; }

.akno-pdf-subscription {
  background: #f0efff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 12px;
}

.akno-pdf-recap-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 11px;
}

.akno-pdf-recap-table td {
  padding: 0 0 7px;
  vertical-align: top;
  color: rgba(255,255,255,0.8);
}

.akno-pdf-recap-table td:last-child {
  text-align: right;
  white-space: nowrap;
  padding-left: 8px;
}

.akno-pdf-recap-tva { font-size: 9px; line-height: 1.35; max-width: 130px; }

.akno-pdf-recap-divider {
  border-top: 1px solid rgba(255,255,255,0.2);
  margin-top: 4px;
  padding-top: 10px;
}

.akno-pdf-recap-total-label {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.55);
  margin: 0;
}

.akno-pdf-recap-total-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  margin: 4px 0 0;
  color: #fff;
}

/* Blocs conditions — empilés, jamais dans une fausse table */
.akno-pdf-info-block {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e3e8ee;
}

.akno-pdf-info-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.akno-pdf-info-row td {
  width: 50%;
  vertical-align: top;
  padding-bottom: 16px;
}

.akno-pdf-info-row td:first-child { padding-right: 12px; }
.akno-pdf-info-row td:last-child { padding-left: 12px; }

/* CGV */
.akno-pdf-legal-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.akno-pdf-legal-table td {
  width: 50%;
  vertical-align: top;
  padding: 0 16px 14px 0;
  font-size: 10px;
  line-height: 1.5;
}

.akno-pdf-legal-table td:nth-child(2) { padding: 0 0 14px 16px; }

/* Signature */
.akno-pdf-signature {
  border: 2px solid #d8dee6;
  border-radius: 10px;
  padding: 18px;
  margin-top: 24px;
}

.akno-pdf-signature-line {
  border-bottom: 1px solid #9aa5b5;
  height: 26px;
  margin-top: 6px;
}

.akno-pdf-signature-box {
  border: 1px dashed #c2c9d6;
  border-radius: 8px;
  height: 72px;
  margin-top: 6px;
}

/* Footer */
.akno-pdf-footer {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #e3e8ee;
  margin-top: 20px;
  padding-top: 10px;
  font-size: 9px;
  color: #697386;
}

.akno-pdf-footer td { vertical-align: middle; padding-top: 10px; }
.akno-pdf-footer td:last-child { text-align: right; font-family: ui-monospace, monospace; }

.pdf-avoid-break,
.akno-pdf-block {
  break-inside: avoid;
  page-break-inside: avoid;
}

.akno-pdf-spacer { height: 16px; }

.akno-pdf-preview-frame .akno-pdf-document {
  margin-inline: auto;
  max-width: 714px;
  padding: 36px 40px;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  box-shadow: 0 7px 14px rgba(60, 66, 87, 0.08);
}
`;
