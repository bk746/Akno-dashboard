import { PDF_DOCUMENT_CSS } from "@/lib/pdf-document-styles";

const A4_WIDTH_PX = 794;
const PDF_EXPORT_TIMEOUT_MS = 90_000;

function formatPdfFilename(filename: string) {
  const safeName = filename
    .trim()
    .replace(/[^\wÀ-ÿ.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
}

function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );
}

function mountInIsolatedIframe(content: HTMLElement) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:1px;border:0;visibility:hidden;pointer-events:none;";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    throw new Error("Impossible de préparer l'export PDF.");
  }

  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PDF_DOCUMENT_CSS}</style></head><body></body></html>`);
  doc.close();

  content.id = "quote-document-export";
  content.style.width = "714px";
  content.style.maxWidth = "714px";
  content.style.padding = "36px 40px";
  content.style.background = "#ffffff";

  doc.body.appendChild(content);

  return iframe;
}

function cleanupPdfArtifacts() {
  document.querySelectorAll(".akno-pdf-export-container, .html2canvas-container").forEach((node) => {
    node.remove();
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export async function downloadDocumentPdf(
  filename: string,
  elementId: string,
): Promise<void> {
  const source = document.getElementById(elementId);
  if (!source) {
    throw new Error("Document introuvable.");
  }

  cleanupPdfArtifacts();

  const clone = source.cloneNode(true) as HTMLElement;
  let iframe: HTMLIFrameElement | null = null;

  try {
    iframe = mountInIsolatedIframe(clone);
    await waitForImages(clone);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const html2pdf = (await import("html2pdf.js")).default;

    const options = {
      margin: [10, 10, 12, 10],
      filename: formatPdfFilename(filename),
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        scrollY: 0,
        scrollX: 0,
        windowWidth: A4_WIDTH_PX,
        width: A4_WIDTH_PX,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
        avoid: [".pdf-avoid-break", ".akno-pdf-block"],
      },
    };

    await withTimeout(
      html2pdf()
        .set(options as never)
        .from(clone)
        .save(),
      PDF_EXPORT_TIMEOUT_MS,
      "La génération du PDF a pris trop de temps. Réessayez.",
    );
  } catch (error) {
    if (error instanceof Error && /oklab|oklch|unsupported color/i.test(error.message)) {
      throw new Error(
        "Erreur de rendu PDF. Réessayez — si le problème persiste, rafraîchissez la page.",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("Impossible de générer le PDF.");
  } finally {
    iframe?.remove();
    cleanupPdfArtifacts();
  }
}
