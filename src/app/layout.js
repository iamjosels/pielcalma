import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import DemoBootstrap from "@/components/DemoBootstrap";
import WebShell from "@/components/web/WebShell";
import Onboarding from "@/components/onboarding/Onboarding";

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

// Display redondeado y amable (combina con la mascota verde).
const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata = {
  title: "PielCalma | Acompañamos cada paso del cuidado atópico",
  description:
    "Tu copiloto cálido para el cuidado de la piel atópica: registra el día, anticipa con tus propios datos y llega preparada a la consulta. No diagnostica.",
  applicationName: "PielCalma",
};

export const viewport = {
  themeColor: "#1f4d3f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] bg-cream text-ink">
        <DemoBootstrap />
        <WebShell>{children}</WebShell>
        <Onboarding />
      </body>
    </html>
  );
}
