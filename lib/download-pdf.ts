export async function downloadDocumentPdf(
  filename: string,
  elementId: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Document introuvable.");
  }

  const clone = element.cloneNode(true) as HTMLElement;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.background = "#ffffff";
  container.style.padding = "24px";
  container.style.zIndex = "-1";
  container.appendChild(clone);
  document.body.appendChild(container);

  const html2pdf = (await import("html2pdf.js")).default;
  const safeName = filename.replace(/[^\wÀ-ÿ.-]+/g, "_");

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
