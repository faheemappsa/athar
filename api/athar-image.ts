import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";

const WIDTH = 1080;
const HEIGHT = 1920;
const APP_URL = "https://athar-sandy.vercel.app";
const FONT_URL = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf";

let fontData: ArrayBuffer | null = null;

const getFont = async () => {
  if (fontData) return fontData;
  const response = await fetch(FONT_URL);
  if (!response.ok) throw new Error("Font loading failed");
  fontData = await response.arrayBuffer();
  return fontData;
};

const clean = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, 420);
};

const makeQrSvg = async () => {
  return QRCode.toString(APP_URL, {
    type: "svg",
    margin: 0,
    width: 118,
    color: {
      dark: "#2F6F57",
      light: "#FFFFFF",
    },
  });
};

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const personalLine = name ? `شارك الأثر • ${name}` : "أثر";

  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        direction: "rtl",
        overflow: "hidden",
        background: "linear-gradient(145deg, #F7FFF9 0%, #EAF6F3 48%, #DDEFE7 100%)",
        fontFamily: "NotoNaskhArabic",
        color: "#284337",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 700,
              height: 700,
              borderRadius: 700,
              left: -210,
              top: -170,
              background: "rgba(125, 199, 167, 0.22)",
              filter: "blur(12px)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 860,
              height: 860,
              borderRadius: 860,
              right: -300,
              bottom: -230,
              border: "2px solid rgba(47, 111, 87, 0.10)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 660,
              height: 660,
              borderRadius: 660,
              left: -230,
              bottom: -210,
              border: "2px solid rgba(47, 111, 87, 0.075)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 150,
              right: 150,
              top: 160,
              height: 470,
              borderLeft: "2px solid rgba(47, 111, 87, 0.07)",
              borderRight: "2px solid rgba(47, 111, 87, 0.07)",
              borderBottom: "2px solid rgba(47, 111, 87, 0.07)",
              borderBottomLeftRadius: 240,
              borderBottomRightRadius: 240,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 54,
              borderRadius: 52,
              border: "1.5px solid rgba(47, 111, 87, 0.13)",
              boxShadow: "0 0 70px rgba(103, 185, 157, 0.20)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 92,
              right: 92,
              top: 190,
              bottom: 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    maxWidth: 850,
                    fontSize: text.length > 140 ? 56 : text.length > 86 ? 65 : 76,
                    lineHeight: 1.95,
                    fontWeight: 700,
                    letterSpacing: -1.4,
                    color: "#1F3B30",
                    textWrap: "balance",
                    whiteSpace: "pre-wrap",
                  },
                  children: text,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: 54,
                    padding: "10px 28px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.62)",
                    color: "rgba(92,75,58,0.75)",
                    fontSize: 31,
                    fontWeight: 700,
                  },
                  children: source,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 92,
              right: 92,
              bottom: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: 126,
                          height: 126,
                          borderRadius: 24,
                          background: "#FFFFFF",
                          padding: 10,
                          boxShadow: "0 18px 44px rgba(31, 59, 48, 0.10)",
                        },
                        dangerouslySetInnerHTML: { __html: qrSvg },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          color: "rgba(31, 59, 48, 0.62)",
                          fontSize: 25,
                          lineHeight: 1.45,
                          fontWeight: 700,
                        },
                        children: [
                          { type: "div", props: { children: "امسح الأثر" } },
                          { type: "div", props: { children: APP_URL.replace("https://", "") } },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: 30,
                    color: "#2F6F57",
                    fontWeight: 800,
                    padding: "12px 26px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.55)",
                  },
                  children: `✦ ${personalLine}`,
                },
              },
            ],
          },
        },
      ],
    },
  };
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const text = clean(req.body?.text, "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ");
    const source = clean(req.body?.source, "الرعد: 28").slice(0, 80);
    const name = clean(req.body?.name, "").slice(0, 28);
    const [font, qrSvg] = await Promise.all([getFont(), makeQrSvg()]);

    const svg = await satori(makeElement(text, source, name, qrSvg) as any, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "NotoNaskhArabic",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    });

    const png = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: WIDTH,
      },
    })
      .render()
      .asPng();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(png));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to generate Athar image" });
  }
}
