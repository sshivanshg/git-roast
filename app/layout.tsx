import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://git-wrapped.vercel.app"
  ),
  title: {
    default: "git wrapped — Roast Your GitHub Commit History Instantly",
    template: "%s — git wrapped"
  },
  description:
    "Get a hilarious, AI-powered roast of your GitHub commits. Enter your username and discover your coding chaos score. No login required. Free tool.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0a0a0b" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "git wrapped",
              description:
                "Get a hilarious, AI-powered roast of your GitHub commits.",
              url: "https://git-wrapped.vercel.app",
              applicationCategory: "DeveloperApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              },
              author: {
                "@type": "Person",
                name: "Shivansh",
                url: "https://www.linkedin.com/in/connect-shivansh/"
              },
              creator: {
                "@type": "Person",
                name: "Shivansh"
              }
            })
          }}
        />
      </head>
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
