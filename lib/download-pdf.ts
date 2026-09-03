const A4_WIDTH_PX = 794;

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

function prepareExportClone(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add("akno-pdf-export");
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.maxWidth = `${A4_WIDTH_PX}px`;
  clone.style.background = "#ffffff";
  clone.style.color = "#0a2540";
  clone.style.boxShadow = "none";
  return clone;
}

export async function downloadDocumentPdf(
  filename: string,
  elementId: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Document introuvable.");
  }

  const clone = prepareExportClone(element);
  const container = document.createElement("div");
  container.className = "akno-pdf-export-container";
  container.appendChild(clone);
  document.body.appendChild(container);

  await waitForImages(clone);
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const html2pdf = (await import("html2pdf.js")).default;

  try {
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

    await html2pdf()
      .set(options as never)
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
