import type { MetadataRoute } from "next";

/** PWA manifest (Persian automotive marketplace). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مای‌استور گاراژ | خدمات و لوازم خودرو",
    short_name: "مای‌استور",
    description:
      "خرید لوازم یدکی و پک‌های تعویض روغن با قیمت شهر خودتان؛ تعویض در محل یا گاراژ.",
    start_url: "/fa",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#059669",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
