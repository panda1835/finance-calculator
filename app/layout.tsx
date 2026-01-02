import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Máy Tính Tài Chính Cá Nhân",
    template: "%s | Máy Tính Tài Chính Cá Nhân",
  },
  description:
    "Công cụ lập kế hoạch tài chính cá nhân miễn phí. Tính toán mục tiêu tự do tài chính, theo dõi tiết kiệm, đầu tư và hình dung lộ trình tài chính của bạn.",
  keywords: [
    "tài chính cá nhân",
    "máy tính tài chính",
    "tự do tài chính",
    "kế hoạch tiết kiệm",
    "đầu tư việt nam",
    "FIRE việt nam",
    "lập kế hoạch hưu trí",
  ],
  authors: [{ name: "Máy Tính Tài Chính" }],
  creator: "Máy Tính Tài Chính",
  publisher: "Máy Tính Tài Chính",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://finance-calculator.borua.dev", // User should update this with actual URL
    siteName: "Máy Tính Tài Chính Cá Nhân",
    title: "Máy Tính Tài Chính Cá Nhân",
    description: "Lên kế hoạch tài chính, tiết kiệm và đầu tư để sớm đạt được tự do tài chính.",
    images: [
      {
        url: "/og-image.png", // Recommended size 1200x630
        width: 1200,
        height: 630,
        alt: "Máy Tính Tài Chính Cá Nhân",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Máy Tính Tài Chính Cá Nhân",
    description: "Công cụ lập kế hoạch tài chính cá nhân miễn phí. Tính toán mục tiêu tự do tài chính, theo dõi tiết kiệm, đầu tư và hình dung lộ trình tài chính của bạn.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Máy Tính Tài Chính",
  },
};

export const viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
