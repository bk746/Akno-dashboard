const A4_WIDTH_PX = 794;
const PDF_EXPORT_TIMEOUT_MS = 90_000;

/** Propriétés CSS copiées en inline — évite que html2canvas parse Tailwind (oklab). */
const INLINE_STYLE_PROPS = [
  "color",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "outline-color",
  "outline-width",
  "outline-style",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "text-decoration-color",
  "white-space",
  "word-break",
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "width",
  "max-width",
  "min-width",
  "height",
  "max-height",
  "min-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "align-items",
  "align-self",
  "justify-content",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "grid-column",
  "grid-row",
  "opacity",
  "box-shadow",
  "overflow",
  "overflow-x",
  "overflow-y",
  "vertical-align",
  "object-fit",
  "list-style-type",
  "table-layout",
  "border-collapse",
  "border-spacing",
  "transform",
  "transform-origin",
] as const;

const UNSUPPORTED_COLOR_RE = /\b(oklab|oklch|color-mix|lab\(|lch\()/i;

function formatPdfFilename(filename: string) {
  const safeName = filename
    .trim()
    .replace(/[^\wÀ-ÿ.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
}

function isUnsupportedColor(value: string) {
  return UNSUPPORTED_COLOR_RE.test(value);
}

/** Lit une couleur calculée en rgb/rgba (le navigateur résout oklab → rgb). */
function readSafeColor(computed: CSSStyleDeclaration, prop: string) {
  const value = computed.getPropertyValue(prop);
  if (value && !isUnsupportedColor(value)) return value;

  const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const fallback = computed[camel as keyof CSSStyleDeclaration];
  if (typeof fallback === "string" && fallback && !isUnsupportedColor(fallback)) {
    return fallback;
  }

  return null;
}

function applyInlineStyles(source: Element, target: HTMLElement) {
  const computed = window.getComputedStyle(source);

  for (const prop of INLINE_STYLE_PROPS) {
    let value = computed.getPropertyValue(prop);
    if (!value || value === "auto" || value === "none") continue;
    if (prop.includes("color") && isUnsupportedColor(value)) {
      value = readSafeColor(computed, prop) ?? "";
    }
    if (!value || isUnsupportedColor(value)) continue;
    target.style.setProperty(prop, value);
  }

  for (const prop of [
    "color",
    "background-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
  ]) {
    const safe = readSafeColor(computed, prop);
    if (safe) target.style.setProperty(prop, safe);
  }
}

function cloneWithInlineStyles(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(false) as HTMLElement;
  clone.removeAttribute("class");
  clone.removeAttribute("id");

  applyInlineStyles(source, clone);

  if (source instanceof HTMLImageElement && clone instanceof HTMLImageElement) {
    clone.src = source.currentSrc || source.src;
    clone.crossOrigin = "anonymous";
    if (source.width) clone.width = source.width;
    if (source.height) clone.height = source.height;
  }

  for (const child of source.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(child.cloneNode(true));
      continue;
    }
    if (child instanceof HTMLElement) {
      clone.appendChild(cloneWithInlineStyles(child));
    }
  }

  return clone;
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
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; color: #0a2540; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; }
  </style></head><body></body></html>`);
  doc.close();

  content.classList.add("akno-pdf-export");
  content.style.width = `${A4_WIDTH_PX}px`;
  content.style.maxWidth = `${A4_WIDTH_PX}px`;
  content.style.background = "#ffffff";
  content.style.color = "#0a2540";
  content.style.boxShadow = "none";

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

  const clone = cloneWithInlineStyles(source);
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
        onclone: (clonedDoc: Document) => {
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
            node.remove();
          });
        },
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
    if (error instanceof Error && error.message.includes("oklab")) {
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
