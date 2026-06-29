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
    width: 86,
    color: {
      dark: "#2D5C4D",
      light: "#F7F1E6",
    },
  });
};

const getTextScale = (text: string) => {
  const length = text.length;
  if (length > 210) return { fontSize: 47, lineHeight: 1.82, top: 440, bottom: 520 };
  if (length > 155) return { fontSize: 54, lineHeight: 1.86, top: 470, bottom: 520 };
  if (length > 95) return { fontSize: 64, lineHeight: 1.9, top: 510, bottom: 520 };
  if (length > 52) return { fontSize: 76, lineHeight: 1.92, top: 540, bottom: 520 };
  return { fontSize: 88, lineHeight: 1.95, top: 560, bottom: 520 };
};

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const sourceLabel = source || "أثر";
  const scale = getTextScale(text);

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
        background: "#F7F1E6",
        fontFamily: "NotoNaskhArabic",
        color: "#21493F",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 6%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.24) 24%, rgba(247,241,230,0) 48%)",
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
              left: -420,
              top: 120,
              border: "2px solid rgba(45,92,77,0.055)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 690,
              height: 690,
              borderRadius: 690,
              right: -410,
              bottom: 260,
              border: "2px solid rgba(45,92,77,0.05)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 66,
              right: 66,
              top: 84,
              bottom: 156,
              display: "flex",
              overflow: "hidden",
              borderRadius: 66,
              background: "#FFFDF8",
              border: "10px solid rgba(255,255,255,0.9)",
              boxShadow: "0 34px 90px rgba(37,79,67,0.16)",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(255,253,248,0.96) 0%, rgba(255,253,248,0.96) 72%, #789783 72%, #789783 100%)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: -70,
                    top: 34,
                    width: 300,
                    height: 620,
                    opacity: 0.1,
                    borderRadius: 200,
                    border: "8px solid #789783",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: -88,
                    bottom: 350,
                    width: 300,
                    height: 430,
                    opacity: 0.08,
                    borderRadius: 200,
                    border: "8px solid #789783",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 112,
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
                          fontSize: 48,
                          lineHeight: 1,
                          color: "#789783",
                        },
                        children: "✦",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          marginTop: 28,
                          fontSize: 48,
                          lineHeight: 1.2,
                          color: "#21493F",
                          fontWeight: 400,
                          letterSpacing: -0.8,
                        },
                        children: "أثر اليوم",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: 138,
                          height: 2,
                          marginTop: 50,
                          background: "rgba(120,151,131,0.34)",
                        },
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
                    left: 86,
                    right: 86,
                    top: scale.top,
                    bottom: scale.bottom,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        maxWidth: 880,
                        fontSize: scale.fontSize,
                        lineHeight: scale.lineHeight,
                        color: "#244F43",
                        fontWeight: 400,
                        letterSpacing: -1.15,
                        whiteSpace: "pre-wrap",
                      },
                      children: text,
                    },
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 320,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2,
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        width: 116,
                        height: 116,
                        borderRadius: 116,
                        background: "#F7F1E6",
                        border: "8px solid rgba(191,177,146,0.58)",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#5C8570",
                        fontSize: 44,
                        boxShadow: "0 12px 26px rgba(37,79,67,0.12)",
                      },
                      children: "❦",
                    },
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
                    bottom: 118,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#FFFDF8",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 20,
                          fontSize: 42,
                          lineHeight: 1.25,
                          fontWeight: 400,
                          letterSpacing: -0.6,
                        },
                        children: [
                          { type: "span", props: { children: "❧" } },
                          { type: "span", props: { children: sourceLabel } },
                          { type: "span", props: { children: "☙" } },
                        ],
                      },
                    },
                    name
                      ? {
                          type: "div",
                          props: {
                            style: {
                              display: "flex",
                              marginTop: 30,
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.18)",
                              border: "1px solid rgba(255,255,255,0.18)",
                              padding: "8px 26px",
                              fontSize: 28,
                              color: "rgba(255,255,255,0.92)",
                            },
                            children: name,
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
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 42,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#5C8570",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    fontSize: 44,
                    lineHeight: 1,
                    fontWeight: 400,
                  },
                  children: [
                    { type: "span", props: { children: "أثر" } },
                    { type: "span", props: { children: "❧" } },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    marginTop: 20,
                    alignItems: "center",
                    gap: 16,
                    fontSize: 24,
                    color: "#496D5F",
                  },
                  children: [
                    { type: "span", props: { children: "— خير يبقى، وأثر لا يزول —" } },
                    {
                      type: "span",
                      props: {
                        style: {
                          display: "flex",
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          overflow: "hidden",
                          opacity: 0.72,
                        },
                        dangerouslySetInnerHTML: { __html: qrSvg },
                      },
                    },
                  ],
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
          weight: 400,
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
