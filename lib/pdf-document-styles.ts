/** Styles PDF — devis simple (compatible html2canvas). */
export const PDF_DOCUMENT_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; }

.akno-pdf-document {
  width: 714px;
  background: #ffffff;
  color: #1a1a2e;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 11px;
  line-height: 1.45;
}

.akno-pdf-inner { padding: 0; }

.akno-pdf-muted { color: #6b7280; }

/* Titre */
.akno-pdf-title-row {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.akno-pdf-title-row td { vertical-align: bottom; padding: 0; }

.akno-pdf-doc-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.akno-pdf-doc-meta {
  text-align: right;
  font-size: 11px;
  color: #6b7280;
}

.akno-pdf-doc-meta strong {
  display: block;
  color: #1a1a2e;
  font-size: 12px;
  font-weight: 600;
}

/* De / Pour */
.akno-pdf-parties {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

.akno-pdf-parties td { vertical-align: top; width: 50%; padding: 0; }

.akno-pdf-parties td:first-child { padding-right: 12px; }

.akno-pdf-parties td:last-child { padding-left: 12px; }

.akno-pdf-from-name {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px;
}

.akno-pdf-from-lines,
.akno-pdf-to-lines {
  font-size: 10.5px;
  line-height: 1.55;
  color: #4b5563;
  margin: 0;
}

.akno-pdf-to-box {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 12px 14px;
}

.akno-pdf-to-name {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 4px;
}

.akno-pdf-logo {
  height: 32px;
  width: auto;
  margin-bottom: 8px;
  display: block;
}

/* Bloc projet (étape 2) */
.akno-pdf-project {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.akno-pdf-project-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1a2e;
  line-height: 1.35;
}

.akno-pdf-project-object {
  font-size: 11px;
  line-height: 1.5;
  color: #374151;
  margin: 0 0 8px;
}

.akno-pdf-project-intro {
  font-size: 10.5px;
  line-height: 1.55;
  color: #6b7280;
  margin: 0;
  white-space: pre-line;
}

/* Tableau lignes */
.akno-pdf-lines {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 10.5px;
}

.akno-pdf-lines thead th {
  text-align: left;
  font-weight: 600;
  font-size: 10px;
  color: #374151;
  padding: 8px 6px;
  border-bottom: 1px solid #e5e7eb;
}

.akno-pdf-lines thead th.num { text-align: right; }

.akno-pdf-lines tbody td {
  padding: 10px 6px;
  vertical-align: top;
  border-bottom: 1px solid #f3f4f6;
}

.akno-pdf-lines tbody td.num {
  text-align: right;
  white-space: nowrap;
}

.akno-pdf-lines tbody td.desc {
  color: #1a1a2e;
}

.akno-pdf-lines .phase-row td {
  background: #fafafa;
  font-weight: 600;
  font-size: 10px;
  color: #635bff;
  padding: 6px;
  border-bottom: 1px solid #e5e7eb;
}

/* Pied de page */
.akno-pdf-footer-row {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.akno-pdf-footer-row td {
  vertical-align: top;
  width: 50%;
  padding: 0;
}

.akno-pdf-footer-row td:first-child { padding-right: 16px; }

.akno-pdf-footer-row td:last-child { padding-left: 16px; }

.akno-pdf-foot-label {
  font-weight: 600;
  font-size: 10.5px;
  margin: 0 0 2px;
  color: #1a1a2e;
}

.akno-pdf-foot-text {
  font-size: 10px;
  line-height: 1.5;
  color: #4b5563;
  margin: 0 0 12px;
  white-space: pre-line;
}

.akno-pdf-totals {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 12px;
}

.akno-pdf-totals td {
  padding: 3px 0;
  vertical-align: top;
}

.akno-pdf-totals td:last-child {
  text-align: right;
  font-weight: 500;
  white-space: nowrap;
}

.akno-pdf-totals tr.grand-total td {
  font-size: 13px;
  font-weight: 700;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
}

.akno-pdf-validity {
  font-size: 10px;
  color: #6b7280;
  margin: 0 0 8px;
  text-align: right;
}

.akno-pdf-sign-label {
  font-size: 9px;
  line-height: 1.4;
  color: #6b7280;
  margin: 0 0 4px;
  text-align: right;
}

.akno-pdf-sign-box {
  border: 1px solid #d1d5db;
  border-radius: 2px;
  height: 72px;
  background: #ffffff;
}

.akno-pdf-sub-note {
  font-size: 10px;
  color: #635bff;
  margin: 12px 0 0;
  padding: 8px 10px;
  background: #f6f5ff;
  border-radius: 4px;
}

.akno-pdf-legal-footer {
  margin-top: 10px;
  font-size: 8px;
  line-height: 1.4;
  color: #9ca3af;
  text-align: center;
}

.akno-pdf-legal-block {
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  page-break-inside: avoid;
}

.akno-pdf-legal-heading {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #374151;
  margin: 0 0 10px;
}

.akno-pdf-legal-items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.akno-pdf-legal-items li {
  margin-bottom: 6px;
  font-size: 8px;
  line-height: 1.45;
  color: #6b7280;
}

.akno-pdf-legal-items li strong {
  display: block;
  font-size: 8px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1px;
}

.akno-pdf-watermark {
  position: absolute;
  top: 45%;
  left: 50%;
  width: 400px;
  margin-left: -200px;
  text-align: center;
  font-size: 48px;
  font-weight: 800;
  color: rgba(0,0,0,0.04);
  transform: rotate(-20deg);
  pointer-events: none;
  z-index: 0;
}

.akno-pdf-document { position: relative; }

.akno-pdf-preview-frame .akno-pdf-document {
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 32px 36px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
`;
