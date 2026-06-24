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
    width: 108,
    color: {
      dark: "#245C49",
      light: "#FFFFFF",
    },
  });
};

const getTextSize = (text: string) => {
  if (text.length > 210) return { fontSize: 46, lineHeight: 1.9, maxWidth: 850 };
  if (text.length > 150) return { fontSize: 52, lineHeight: 1.95, maxWidth: 850 };
  if (text.length > 95) return { fontSize: 62, lineHeight: 2, maxWidth: 835 };
  return { fontSize: 76, lineHeight: 2.05, maxWidth: 820 };
};

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const personalLine = name ? `شارك الأثر • ${name}` : "أثر";
  const textStyle = getTextSize(text);

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
        background: "linear-gradient(155deg, #FBFFF9 0%, #EFF8F2 42%, #DCEFE6 100%)",
        fontFamily: "NotoNaskhArabic",
        color: "#1F3B30",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 28% 18%, rgba(115, 196, 155, 0.24), transparent 26%), radial-gradient(circle at 86% 82%, rgba(47, 111, 87, 0.16), transparent 30%), linear-gradient(110deg, rgba(255,255,255,0.55), transparent 48%)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 920,
              height: 920,
              borderRadius: 920,
              right: -390,
              top: -330,
              border: "2px solid rgba(36, 92, 73, 0.070)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 980,
              height: 980,
              borderRadius: 980,
              left: -420,
              bottom: -370,
              border: "2px solid rgba(36, 92, 73, 0.075)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 118,
              right: 118,
              top: 150,
              height: 520,
              borderLeft: "2px solid rgba(36, 92, 73, 0.065)",
              borderRight: "2px solid rgba(36, 92, 73, 0.065)",
              borderBottom: "2px solid rgba(36, 92, 73, 0.065)",
              borderBottomLeftRadius: 280,
              borderBottomRightRadius: 280,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 54,
              borderRadius: 58,
              border: "1.5px solid rgba(36, 92, 73, 0.14)",
              boxShadow: "0 0 88px rgba(103, 185, 157, 0.22), inset 0 0 80px rgba(255,255,255,0.34)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 116,
              right: 116,
              top: 220,
              bottom: 250,
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
                    maxWidth: textStyle.maxWidth,
                    fontSize: textStyle.fontSize,
                    lineHeight: textStyle.lineHeight,
                    fontWeight: 700,
                    letterSpacing: -1.3,
                    color: "#1E3B30",
                    textWrap: "balance",
                    whiteSpace: "pre-wrap",
                    textShadow: "0 10px 34px rgba(31, 59, 48, 0.08)",
                  },
                  children: text,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: 60,
                    padding: "10px 30px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.56)",
                    border: "1px solid rgba(36, 92, 73, 0.08)",
                    color: "rgba(92,75,58,0.72)",
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
              bottom: 92,
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
                    gap: 20,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: 118,
                          height: 118,
                          borderRadius: 24,
                          background: "#FFFFFF",
                          padding: 9,
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
                          fontSize: 34,
                          color: "#245C49",
                          fontWeight: 800,
                          letterSpacing: -0.6,
                        },
                        children: "أثر",
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
                    fontSize: 28,
                    color: "rgba(36, 92, 73, 0.88)",
                    fontWeight: 800,
                    padding: "12px 26px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.58)",
                    border: "1px solid rgba(36, 92, 73, 0.08)",
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
