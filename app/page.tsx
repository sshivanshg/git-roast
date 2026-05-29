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
  const title = u ? `@${u} — git wrapped` : "git wrapped — roast your commits";
  const description = u
    ? `See how chaotic @${u}'s GitHub really is.`
    : "Paste a GitHub username and get roasted by your own commit history.";

  return {
    metadataBase: new URL(SITE),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export default function Page() {
  return <RoastApp />;
}
