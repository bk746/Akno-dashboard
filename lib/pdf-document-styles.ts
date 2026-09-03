/** Styles PDF — hex/rgb uniquement, layout table (compatible html2canvas). */
export const PDF_DOCUMENT_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }

.akno-pdf-document {
  position: relative;
  width: 794px;
  max-width: 794px;
  padding: 36px 40px 40px;
  background: #ffffff;
  color: #0a2540;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 11px;
  line-height: 1.45;
  overflow: visible;
}

.akno-pdf-watermark {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-size: 64px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: rgba(10, 37, 64, 0.05);
  transform: rotate(-24deg);
}

.akno-pdf-document > :not(.akno-pdf-watermark) {
  position: relative;
  z-index: 1;
}

.akno-pdf-muted { color: #697386; }
.akno-pdf-accent { color: #635bff; }
.akno-pdf-text { color: #0a2540; }
.akno-pdf-white { color: #ffffff; }
.akno-pdf-white-muted { color: rgba(255, 255, 255, 0.75); }

.akno-pdf-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #697386;
  margin: 0 0 4px;
}

.akno-pdf-label-accent {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #635bff;
  margin: 0 0 4px;
}

/* ── En-tête ── */
.akno-pdf-header {
  display: table;
  width: 100%;
  margin-bottom: 24px;
}

.akno-pdf-header-left,
.akno-pdf-header-right {
  display: table-cell;
  vertical-align: top;
}

.akno-pdf-header-right {
  text-align: right;
  width: 200px;
}

.akno-pdf-header-logo {
  height: 36px;
  width: auto;
  display: block;
}

.akno-pdf-header-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  letter-spacing: -0.02em;
}

.akno-pdf-header-number {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  color: #635bff;
  margin: 6px 0 0;
}

/* ── Bandeau dates ── */
.akno-pdf-meta {
  display: table;
  width: 100%;
  table-layout: fixed;
  background: #f6f9fc;
  border-radius: 12px;
  margin-bottom: 28px;
}

.akno-pdf-meta-cell {
  display: table-cell;
  padding: 14px 18px;
  vertical-align: top;
}

.akno-pdf-meta-cell-right {
  text-align: right;
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

/* ── Titre projet ── */
.akno-pdf-project-title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  margin: 8px 0 0;
  letter-spacing: -0.02em;
}

.akno-pdf-project-sub {
  font-size: 11px;
  line-height: 1.5;
  color: #697386;
  margin: 8px 0 0;
  max-width: 520px;
}

/* ── Blocs De / Pour ── */
.akno-pdf-parties {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 16px 0;
  margin: 24px 0;
}

.akno-pdf-party {
  display: table-cell;
  width: 50%;
  vertical-align: top;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  padding: 16px;
}

.akno-pdf-party-client {
  border-color: rgba(99, 91, 255, 0.25);
  background: rgba(99, 91, 255, 0.04);
}

.akno-pdf-party-name {
  font-size: 13px;
  font-weight: 700;
  margin: 8px 0 0;
}

.akno-pdf-party-lines {
  font-size: 10.5px;
  line-height: 1.55;
  color: #697386;
  margin: 10px 0 0;
}

.akno-pdf-party-lines p {
  margin: 0 0 3px;
}

/* ── Intro ── */
.akno-pdf-intro {
  font-size: 11.5px;
  line-height: 1.55;
  color: rgba(10, 37, 64, 0.85);
  margin: 8px 0 0;
  white-space: pre-line;
}

/* ── Tableau prestations ── */
.akno-pdf-section-head {
  border-bottom: 2px solid #0a2540;
  padding-bottom: 8px;
  margin: 28px 0 16px;
}

.akno-pdf-section-head-table {
  display: table;
  width: 100%;
}

.akno-pdf-section-head-table > span {
  display: table-cell;
  vertical-align: bottom;
}

.akno-pdf-section-head-table > span:last-child {
  text-align: right;
  font-size: 9.5px;
  color: #697386;
}

.akno-pdf-phase {
  margin-bottom: 20px;
}

.akno-pdf-phase-title-row {
  display: table;
  width: 100%;
  margin-bottom: 8px;
}

.akno-pdf-phase-num {
  display: table-cell;
  width: 28px;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #635bff;
  vertical-align: top;
}

.akno-pdf-phase-text {
  display: table-cell;
  vertical-align: top;
}

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

.akno-pdf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.akno-pdf-table th {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #697386;
  font-weight: 600;
  padding: 0 0 6px;
  text-align: right;
}

.akno-pdf-table th:first-child {
  text-align: left;
  padding-left: 28px;
}

.akno-pdf-table td {
  border-top: 1px solid rgba(10, 37, 64, 0.08);
  padding: 8px 0;
  vertical-align: top;
}

.akno-pdf-table td:first-child {
  padding-left: 28px;
  padding-right: 12px;
}

.akno-pdf-table .col-qty { width: 56px; text-align: right; color: #697386; }
.akno-pdf-table .col-price { width: 80px; text-align: right; color: #697386; }
.akno-pdf-table .col-total { width: 80px; text-align: right; font-weight: 600; }

.akno-pdf-line-title {
  font-weight: 500;
  line-height: 1.35;
  margin: 0;
}

.akno-pdf-line-detail {
  font-size: 10px;
  color: #697386;
  margin: 3px 0 0;
  line-height: 1.4;
}

.akno-pdf-subtotal-row td {
  border-top: 1px solid rgba(10, 37, 64, 0.08);
  padding-top: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #697386;
}

/* ── Options ── */
.akno-pdf-options {
  border: 1px dashed rgba(10, 37, 64, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
}

/* ── Échéancier + récap (2 colonnes table) ── */
.akno-pdf-summary-row {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 20px 0;
  margin: 28px 0;
}

.akno-pdf-schedule,
.akno-pdf-recap-box {
  display: table-cell;
  vertical-align: top;
}

.akno-pdf-schedule {
  width: 58%;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  padding: 16px;
}

.akno-pdf-recap-box {
  width: 42%;
  background: #0a2540;
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
}

.akno-pdf-pay-row {
  display: table;
  width: 100%;
  margin-bottom: 12px;
}

.akno-pdf-pay-row + .akno-pdf-pay-row {
  border-top: 1px solid rgba(10, 37, 64, 0.08);
  padding-top: 12px;
}

.akno-pdf-pay-label,
.akno-pdf-pay-amount {
  display: table-cell;
  vertical-align: top;
}

.akno-pdf-pay-amount {
  text-align: right;
  font-weight: 700;
  white-space: nowrap;
  width: 90px;
  padding-left: 12px;
}

.akno-pdf-pay-title {
  font-weight: 600;
  margin: 0 0 3px;
  line-height: 1.35;
}

.akno-pdf-pay-sub {
  font-size: 10px;
  color: #697386;
  margin: 0;
  line-height: 1.4;
}

.akno-pdf-subscription {
  background: rgba(99, 91, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  margin-top: 14px;
}

.akno-pdf-recap-line {
  display: table;
  width: 100%;
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 1.5;
}

.akno-pdf-recap-line > span {
  display: table-cell;
  vertical-align: top;
}

.akno-pdf-recap-line > span:last-child {
  text-align: right;
  white-space: nowrap;
  padding-left: 8px;
}

.akno-pdf-recap-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin: 12px 0;
  padding-top: 12px;
}

.akno-pdf-recap-total-label {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.akno-pdf-recap-total-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  margin: 4px 0 0;
}

.akno-pdf-recap-tva-note {
  font-size: 9.5px;
  line-height: 1.35;
  text-align: right;
  max-width: 140px;
}

/* ── Conditions 2 col ── */
.akno-pdf-conditions {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 20px 0;
  margin: 28px 0;
}

.akno-pdf-condition-cell {
  display: table-cell;
  width: 50%;
  vertical-align: top;
}

.akno-pdf-condition-full {
  display: block;
  width: 100%;
  margin-top: 16px;
}

.akno-pdf-body-text {
  font-size: 10.5px;
  line-height: 1.55;
  color: rgba(10, 37, 64, 0.85);
  margin: 6px 0 0;
  white-space: pre-line;
}

/* ── CGV grid ── */
.akno-pdf-legal-grid {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 0 14px;
  margin-top: 12px;
}

.akno-pdf-legal-row {
  display: table-row;
}

.akno-pdf-legal-cell {
  display: table-cell;
  width: 50%;
  vertical-align: top;
  padding-right: 24px;
  padding-bottom: 14px;
}

.akno-pdf-legal-text {
  font-size: 10px;
  line-height: 1.5;
  color: rgba(10, 37, 64, 0.75);
  margin: 4px 0 0;
}

/* ── Bon pour accord ── */
.akno-pdf-signature {
  border: 2px solid rgba(10, 37, 64, 0.15);
  border-radius: 12px;
  padding: 20px;
  margin-top: 28px;
}

.akno-pdf-signature-top {
  display: table;
  width: 100%;
  margin-bottom: 20px;
}

.akno-pdf-signature-intro,
.akno-pdf-signature-amount {
  display: table-cell;
  vertical-align: top;
}

.akno-pdf-signature-amount {
  text-align: right;
  white-space: nowrap;
  padding-left: 16px;
}

.akno-pdf-signature-fields {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 20px 0;
}

.akno-pdf-signature-field {
  display: table-cell;
  vertical-align: bottom;
}

.akno-pdf-signature-line {
  border-bottom: 1px solid rgba(10, 37, 64, 0.3);
  height: 28px;
  margin-top: 8px;
}

.akno-pdf-signature-box {
  border: 1px dashed rgba(10, 37, 64, 0.25);
  border-radius: 10px;
  height: 80px;
  margin-top: 8px;
  padding: 10px;
}

.akno-pdf-signature-boxes {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-spacing: 20px 0;
  margin-top: 16px;
}

.akno-pdf-signature-box-cell {
  display: table-cell;
  vertical-align: top;
  width: 50%;
}

/* ── Footer ── */
.akno-pdf-footer {
  display: table;
  width: 100%;
  border-top: 1px solid rgba(10, 37, 64, 0.1);
  padding-top: 10px;
  margin-top: 20px;
  font-size: 9px;
  color: #697386;
}

.akno-pdf-footer-left,
.akno-pdf-footer-right {
  display: table-cell;
  vertical-align: middle;
}

.akno-pdf-footer-right {
  text-align: right;
  font-family: ui-monospace, monospace;
}

.pdf-avoid-break,
.akno-pdf-block {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Preview dans l'app (pas export) */
.akno-pdf-preview-frame .akno-pdf-document {
  margin-inline: auto;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  box-shadow: 0 7px 14px rgba(60, 66, 87, 0.08);
}
`;
