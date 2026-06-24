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
    width: 92,
    color: {
      dark: "#234C40",
      light: "#FFFFFF",
    },
  });
};

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const isLong = text.length > 150;
  const isMedium = text.length > 92;
  const isShort = text.length <= 52;
  const fontSize = isLong ? 52 : isMedium ? 64 : isShort ? 86 : 76;
  const lineHeight = isLong ? 1.84 : isMedium ? 1.9 : 1.98;
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
        background: "linear-gradient(150deg, #FBF8F0 0%, #F7F3E8 44%, #EAF4EE 100%)",
        fontFamily: "NotoNaskhArabic",
        color: "#20382E",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 34,
              borderRadius: 72,
              border: "1px solid rgba(35, 76, 64, 0.08)",
              boxShadow: "0 34px 100px rgba(31, 59, 48, 0.10)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 780,
              height: 780,
              borderRadius: 780,
              left: -310,
              top: -260,
              background: "radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(143,211,179,0.18) 52%, rgba(143,211,179,0) 72%)",
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
              right: -420,
              bottom: -350,
              border: "2px solid rgba(35, 76, 64, 0.055)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 680,
              height: 680,
              borderRadius: 680,
              left: -260,
              bottom: -220,
              border: "2px solid rgba(35, 76, 64, 0.045)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 82,
              right: 82,
              top: 92,
              height: 500,
              borderLeft: "1.5px solid rgba(35, 76, 64, 0.045)",
              borderRight: "1.5px solid rgba(35, 76, 64, 0.045)",
              borderBottom: "1.5px solid rgba(35, 76, 64, 0.045)",
              borderBottomLeftRadius: 250,
              borderBottomRightRadius: 250,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 84,
              right: 84,
              top: 96,
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            },
            children: {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 30px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.42)",
                  color: "rgba(47,111,87,0.82)",
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                },
                children: "أثر اليوم",
              },
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: 78,
              right: 78,
              top: 260,
              bottom: 330,
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
                    maxWidth: 900,
                    fontSize,
                    lineHeight,
                    fontWeight: 700,
                    letterSpacing: -1.3,
                    color: "#1E352B",
                    textWrap: "balance",
                    whiteSpace: "pre-wrap",
                    textShadow: "0 16px 44px rgba(31, 59, 48, 0.05)",
                  },
                  children: text,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: 62,
                    height: 1,
                    marginTop: 52,
                    marginBottom: 32,
                    background: "rgba(47,111,87,0.16)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    color: "rgba(92,75,58,0.64)",
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: -0.2,
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
              left: 72,
              right: 72,
              bottom: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 26,
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
                          width: 104,
                          height: 104,
                          borderRadius: 22,
                          background: "rgba(255,255,255,0.88)",
                          padding: 9,
                          boxShadow: "0 16px 42px rgba(31, 59, 48, 0.11)",
                        },
                        dangerouslySetInnerHTML: { __html: qrSvg },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: 1,
                          height: 78,
                          background: "rgba(35, 76, 64, 0.16)",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "center",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                fontSize: 38,
                                color: "#254F43",
                                fontWeight: 800,
                                letterSpacing: -0.7,
                                lineHeight: 1,
                              },
                              children: "أثر",
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                marginTop: 10,
                                fontSize: 22,
                                color: "rgba(35, 76, 64, 0.66)",
                                fontWeight: 700,
                                direction: "ltr",
                                letterSpacing: -0.2,
                              },
                              children: "athar-sandy.vercel.app",
                            },
                          },
                        ],
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
                        fontSize: 26,
                        color: "rgba(39, 93, 74, 0.72)",
                        fontWeight: 800,
                        padding: "10px 22px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.46)",
                        border: "1px solid rgba(39, 93, 74, 0.07)",
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
