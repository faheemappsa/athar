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
    width: 104,
    color: {
      dark: "#275D4A",
      light: "#FFFFFF",
    },
  });
};

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const isLong = text.length > 140;
  const isMedium = text.length > 86;
  const fontSize = isLong ? 54 : isMedium ? 64 : 76;
  const sourceLabel = source || "أثر";

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
        background: "linear-gradient(145deg, #F8FFFB 0%, #EEF8F2 44%, #DFEFE7 100%)",
        fontFamily: "NotoNaskhArabic",
        color: "#20382E",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 42,
              borderRadius: 64,
              border: "1.5px solid rgba(39, 93, 74, 0.13)",
              boxShadow: "0 0 88px rgba(91, 169, 135, 0.22)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 760,
              height: 760,
              borderRadius: 760,
              left: -260,
              top: -230,
              background: "rgba(143, 211, 179, 0.26)",
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
              right: -340,
              bottom: -270,
              border: "2px solid rgba(39, 93, 74, 0.10)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 650,
              height: 650,
              borderRadius: 650,
              left: -260,
              bottom: -230,
              border: "2px solid rgba(39, 93, 74, 0.065)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 146,
              right: 146,
              top: 142,
              height: 520,
              borderLeft: "2px solid rgba(39, 93, 74, 0.06)",
              borderRight: "2px solid rgba(39, 93, 74, 0.06)",
              borderBottom: "2px solid rgba(39, 93, 74, 0.06)",
              borderBottomLeftRadius: 260,
              borderBottomRightRadius: 260,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 80,
              right: 80,
              top: 155,
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
                    fontSize,
                    lineHeight: isLong ? 1.9 : 2.02,
                    fontWeight: 700,
                    letterSpacing: -1.2,
                    color: "#1E352B",
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
                    padding: "11px 30px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.58)",
                    border: "1px solid rgba(39, 93, 74, 0.07)",
                    color: "rgba(92,75,58,0.72)",
                    fontSize: 30,
                    fontWeight: 700,
                  },
                  children: sourceLabel,
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
              left: 84,
              right: 84,
              bottom: 78,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: 116,
                          height: 116,
                          borderRadius: 24,
                          background: "#FFFFFF",
                          padding: 10,
                          boxShadow: "0 16px 44px rgba(31, 59, 48, 0.10)",
                        },
                        dangerouslySetInnerHTML: { __html: qrSvg },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: 32,
                          color: "#2F6F57",
                          fontWeight: 800,
                          letterSpacing: -0.5,
                        },
                        children: "أثر",
                      },
                    },
                  ],
                },
              },
              name
                ? {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        fontSize: 29,
                        color: "rgba(39, 93, 74, 0.84)",
                        fontWeight: 800,
                        padding: "12px 24px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.54)",
                        border: "1px solid rgba(39, 93, 74, 0.07)",
                      },
                      children: `✦ شارك الأثر • ${name}`,
                    },
                  }
                : {
                    type: "div",
                    props: { style: { display: "flex", width: 1, height: 1, opacity: 0 }, children: "" },
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
