import { ImageResponse } from "next/og";
import { computeRoast } from "@/lib/roast";

export const runtime = "nodejs";

const W = 1200;
const H = 630;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("u");

  if (!username) {
    return new ImageResponse(<Fallback text="git wrapped" />, { width: W, height: H });
  }

  try {
    const r = await computeRoast(username);
    const clip = (s: string) => (s.length > 150 ? s.slice(0, 148) + "…" : s);
    const top = r.lines.slice(0, 2).map((l) => ({ ...l, text: clip(l.text) }));
    const tc = `rgb(${r.tier.color})`;
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0a0a0a",
            color: "#ededed",
            padding: "64px 72px",
            fontFamily: "monospace"
          }}
        >
          {/* header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {r.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.avatar}
                  width={92}
                  height={92}
                  style={{
                    borderRadius: 999,
                    border: "1px solid #262626",
                    filter: "grayscale(1)"
                  }}
                  alt=""
                />
              ) : null}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 44, fontWeight: 600, color: "#f5f5f5" }}>
                  {`@${r.username}`}
                </div>
                <div style={{ display: "flex", fontSize: 26, color: "#8a8a8a" }}>
                  {r.title}
                </div>
                <div style={{ display: "flex", fontSize: 22, color: tc, marginTop: 6, letterSpacing: 1 }}>
                  {`${r.tier.name} · ${r.tier.rarity}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {/* grade badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 22px",
                  borderRadius: 20,
                  background: `rgba(${r.tier.color},0.12)`,
                  border: `2px solid rgba(${r.tier.color},0.5)`
                }}
              >
                <div style={{ display: "flex", fontSize: 60, fontWeight: 800, color: tc }}>
                  {r.tier.grade}
                </div>
                <div style={{ display: "flex", fontSize: 16, color: "#777", letterSpacing: 4 }}>
                  RANK
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end"
                }}
              >
                <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: tc }}>
                  {String(r.score)}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 20,
                    color: "#6a6a6a",
                    letterSpacing: 4
                  }}
                >
                  CHAOS
                </div>
              </div>
            </div>
          </div>

          {/* hairline divider */}
          <div style={{ display: "flex", height: 1, background: "#1c1c1c", marginTop: 40 }} />

          {/* roast lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 40 }}>
            {top.map((l, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  fontSize: 26,
                  lineHeight: 1.35
                }}
              >
                <div style={{ display: "flex" }}>{l.emoji}</div>
                <div style={{ display: "flex", color: "#d0d0d0" }}>{l.text}</div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontSize: 22,
              color: "#555555",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex" }}>git wrapped</div>
            <div style={{ display: "flex" }}>roast your own commits →</div>
          </div>
        </div>
      ),
      { width: W, height: H }
    );
  } catch {
    return new ImageResponse(<Fallback text={`@${username}`} />, { width: W, height: H });
  }
}

function Fallback({ text }: { text: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontSize: 72,
        fontFamily: "monospace",
        fontWeight: 700
      }}
    >
      {text}
    </div>
  );
}
