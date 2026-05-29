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
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is git wrapped?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "git wrapped is a fun web app that analyzes your GitHub commit history and gives you a hilarious roast based on your coding patterns, commit messages, and contributions."
            }
          },
          {
            "@type": "Question",
            name: "Is my data safe?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, git wrapped only uses publicly available GitHub data. We don't store any personal information and you don't need to log in."
            }
          },
          {
            "@type": "Question",
            name: "How is the chaos score calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The chaos score is calculated based on various factors including commit frequency, message quality, timing patterns, and coding consistency across your recent commits."
            }
          },
          {
            "@type": "Question",
            name: "Can I share my roast?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Absolutely! You can share your result on X (Twitter), download it as an image, or copy the link to share with friends."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <RoastApp />
    </>
  );
}
