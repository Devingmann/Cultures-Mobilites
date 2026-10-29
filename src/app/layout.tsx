import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cultures et Mobilités — Photos, retours de sorties et avis",
  description:
    "Le site du groupe « Culture et mobilité » : journal des sorties culturelles, galerie photo, drive partagé et sondages. Un projet transversal porté par APIJE Mobilité, la SCIC IFAD Accompagnement Intégré et IFAD SCOP Parcours Santé Mieux Être.",
  keywords: [
    "culture",
    "mobilité",
    "sorties culturelles",
    "journal de groupe",
    "réinsertion",
    "APIJE",
    "IFAD",
    "Ganges",
  ],
  icons: {
    icon: "/images/logo-192.png",
    apple: "/images/logo-180.png",
  },
  openGraph: {
    title: "Cultures et Mobilités",
    description: "Photos, retours de sorties et avis — le site du groupe.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
