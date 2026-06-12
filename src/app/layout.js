import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import DemoBootstrap from "@/components/DemoBootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display editorial cálido (excepción creative/editorial del skill).
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "PielCalma | Bitácora inteligente de cuidado",
  description:
    "Acompañamiento inteligente para madres cuidadoras de niños con dermatitis atópica.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <DemoBootstrap />
        {children}
      </body>
    </html>
  );
}
