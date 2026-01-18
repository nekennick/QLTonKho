import type { Metadata } from "next";
import { Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/providers/QueryProvider";

// Font chính cho tiếng Việt
const nunitoSans = Nunito_Sans({ 
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito-sans"
});

// Font phụ
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Tồn kho ĐTB - Hệ thống quản lý kho",
  description: "Hệ thống quản lý kho chuyên nghiệp của Ninh Phước",
  keywords: "Tồn kho ĐTB, quản lý kho, ERP, Goal Company",
  authors: [{ name: "Goal Company" }],
  creator: "Ninh Phước",
  publisher: "Ninh Phước",
  robots: "index, follow",
  icons: {
    icon: "/logo1.png",
    apple: "/logo1.png",
    shortcut: "/logo1.png",
  },
  openGraph: {
    type: "website",
    title: "Tồn kho ĐTB",
    description: "Hệ thống quản lý kho chuyên nghiệp",
    siteName: "NZ ERP PRO",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tồn kho ĐTB",
    description: "Hệ thống quản lý kho chuyên nghiệp",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${nunitoSans.variable} ${inter.variable}`}>
      <head>
       <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${nunitoSans.className} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}