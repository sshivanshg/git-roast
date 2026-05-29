import type { Metadata } from "next";
import RoastApp from "@/components/RoastApp";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://git-wrapped.vercel.app";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ u?: string }>;
}): Promise<Metadata> {
  const { u } = await searchParams;
  const ogImage = u
    ? `${SITE}/api/og?u=${encodeURIComponent(u)}`
    : `${SITE}/api/og`;
  const title = u
    ? `@${u} — git wrapped | GitHub Commit History Roast`
    : "git wrapped — Roast Your GitHub Commit History Instantly";
  const description = u
    ? `See how chaotic @${u}'s GitHub really is. Get a hilarious roast of @${u}'s commit history, chaos score, and coding patterns.`
    : "Get a hilarious, AI-powered roast of your GitHub commits. Enter your username and discover your coding chaos score. No login required. Free tool.";

  const keywords = u
    ? [`${u} github`, "github roast", "commit history", "github profile"]
    : [
        "github roast",
        "commit roaster",
        "github commits",
        "coding roast",
        "github analyzer",
        "commit history analyzer",
        "github tool",
        "developer tool",
        "git wrapped"
      ];

  return {
    metadataBase: new URL(SITE),
    title,
    description,
    keywords,
    authors: [{ name: "Shivansh", url: "https://www.linkedin.com/in/connect-shivansh/" }],
    creator: "Shivansh",
    openGraph: {
      title,
      description,
      url: u ? `${SITE}/?u=${u}` : SITE,
      siteName: "git wrapped",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: u ? `@${u} git wrapped roast` : "git wrapped - roast your commits"
        }
      ],
      type: "website",
      locale: "en_US"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@sshivanshg"
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1
      }
    },
    alternates: {
      canonical: u ? `${SITE}/?u=${u}` : SITE
    }
  };
}

export default function Page() {
  return <RoastApp />;
}
