import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;
const FONT_URL = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf";

let fontData: ArrayBuffer | null = null;

const getFont = async () => {
  if (fontData) return fontData;
  const response = await fetch(FONT_URL);
  if (!response.ok) throw new Error("Font loading failed");
  fontData = await response.arrayBuffer();
  return fontData;
};

const makeElement = () => ({
  type: "div",
  props: {
    style: {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      position: "relative",
      direction: "rtl",
      overflow: "hidden",
      background: "linear-gradient(145deg, #F8FFFD 0%, #EAF6F3 100%)",
      fontFamily: "NotoNaskhArabic",
      color: "#244A3F",
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 420,
            right: -120,
            top: -140,
            background: "rgba(56,164,124,0.10)",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 520,
            left: -180,
            bottom: -210,
            border: "3px solid rgba(56,164,124,0.10)",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: 86,
            right: 86,
            top: 70,
            bottom: 70,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRadius: 64,
            background: "rgba(255,255,255,0.86)",
            border: "1.5px solid rgba(56,164,124,0.14)",
            boxShadow: "0 24px 80px rgba(31,123,95,0.14)",
            padding: "54px 76px",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 60,
                  lineHeight: 1,
                  marginBottom: 18,
                },
                children: "🌿",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 86,
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: "#244A3F",
                  marginBottom: 28,
                },
                children: "أثر",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 38,
                  lineHeight: 1.65,
                  fontWeight: 800,
                  color: "#244A3F",
                  marginBottom: 22,
                },
                children: "وقف خيري عن مسلّم عوده البويني رحمه الله",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 31,
                  lineHeight: 1.6,
                  fontWeight: 700,
                  color: "#6F8F86",
                  marginBottom: 38,
                },
                children: "رفيق يومي للأذكار وورد القرآن ومشاركة الأثر",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 33,
                  lineHeight: 1.7,
                  fontWeight: 800,
                  color: "#38A47C",
                  marginBottom: 8,
                },
                children: "لعلنا نكون منهم...",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  fontSize: 38,
                  lineHeight: 1.65,
                  fontWeight: 800,
                  color: "#244A3F",
                },
                children: "﴿ وولدٌ صالحٌ يدعو له ﴾",
              },
            },
          ],
        },
      },
    ],
  },
});

export default async function handler(_req: any, res: any) {
  try {
    const font = await getFont();
    const svg = await satori(makeElement() as any, {
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
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.status(200).send(Buffer.from(png));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to generate OG image" });
  }
}
