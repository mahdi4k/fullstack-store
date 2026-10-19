import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { dirOf, type Locale } from "@/lib/i18n/config";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Persian UI font — IRANYekanX (variable, FaNum edition: Latin digits render
// as Persian ۰۱۲۳ on RTL pages). Served from public/fonts.
const iranYekan = localFont({
  variable: "--font-iran-yekan",
  src: "../../../public/fonts/IRANYekanXVFaNumVF.woff2",
  weight: "100 900",
});

export function generateStaticParams() {
  return [{ lang: "fa" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: {
      default: dict.meta.titleDefault,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html
      lang={lang}
      dir={dirOf(lang as Locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${iranYekan.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {/* Dictionary seeds every client component (navbar, cart, admin…). */}
        <LocaleProvider locale={lang as Locale} dict={dict}>
          <AuthProvider>
            <CartProvider>
              <QueryProvider>{children}</QueryProvider>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
