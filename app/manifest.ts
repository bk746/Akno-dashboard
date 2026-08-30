import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AKNO — Cockpit entreprise",
    short_name: "AKNO",
    description:
      "Pilotez votre activité : clients, devis, factures, finances et planning.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f9fc",
    theme_color: "#635bff",
    lang: "fr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/eclypse2-x2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/eclypse2-x2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
