import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";

const WIDTH = 1080;
const HEIGHT = 1920;
const APP_URL = "https://athar-sandy.vercel.app";

const FONT_URLS = [
  "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf",
  "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Medium.ttf",
];

let regularFontData: ArrayBuffer | null = null;
let mediumFontData: ArrayBuffer | null = null;

const fetchFont = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "athar-image-generator/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Font loading failed: ${response.status}`);
  }

  return response.arrayBuffer();
};

const getRegularFont = async () => {
  if (regularFontData) return regularFontData;
  regularFontData = await fetchFont(FONT_URLS[0]);
  return regularFontData;
};

const getMediumFont = async () => {
  if (mediumFontData) return mediumFontData;
  try {
    mediumFontData = await fetchFont(FONT_URLS[1]);
  } catch {
    mediumFontData = await getRegularFont();
  }
  return mediumFontData;
};

const normalizeArabicText = (value: string) =>
  value
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clean = (value: unknown, fallback = "", maxLength = 420) => {
  if (typeof value !== "string") return fallback;
  const cleaned = normalizeArabicText(value);
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
};

const makeQrSvg = async () => {
  return QRCode.toString(APP_URL, {
    type: "svg",
    margin: 0,
    width: 76,
    color: {
      dark: "#2F5F50",
      light: "#F7F1E6",
    },
  });
};

type TextScale = {
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  minHeight: number;
};

const getTextScale = (text: string): TextScale => {
  const length = text.length;

  if (length > 260) {
    return { fontSize: 45, lineHeight: 1.95, maxWidth: 850, minHeight: 720 };
  }

  if (length > 210) {
    return { fontSize: 50, lineHeight: 1.98, maxWidth: 850, minHeight: 700 };
  }

  if (length > 160) {
    return { fontSize: 57, lineHeight: 2.02, maxWidth: 850, minHeight: 680 };
  }

  if (length > 105) {
    return { fontSize: 66, lineHeight: 2.04, maxWidth: 830, minHeight: 640 };
  }

  if (length > 58) {
    return { fontSize: 76, lineHeight: 2.08, maxWidth: 800, minHeight: 600 };
  }

  return { fontSize: 88, lineHeight: 2.12, maxWidth: 760, minHeight: 560 };
};

const div = (style: Record<string, unknown>, children?: unknown) => ({
  type: "div",
  props: {
    style,
    children,
  },
});

const span = (style: Record<string, unknown>, children?: unknown) => ({
  type: "span",
  props: {
    style,
    children,
  },
});

const makeElement = (text: string, source: string, name: string, qrSvg: string) => {
  const scale = getTextScale(text);
  const sourceLabel = source || "أثر اليوم";

  return div(
    {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      position: "relative",
      direction: "rtl",
      overflow: "hidden",
      background: "#F7F1E6",
      fontFamily: "NotoNaskhArabic",
      color: "#234C41",
    },
    [
      div({
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 4%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.28) 28%, rgba(247,241,230,0) 54%), linear-gradient(180deg, #F9F3E8 0%, #F7F1E6 56%, #EEF3EC 100%)",
      }),
      div({
        position: "absolute",
        left: -360,
        top: 160,
        width: 780,
        height: 780,
        borderRadius: 780,
        border: "2px solid rgba(47,95,80,0.055)",
      }),
      div({
        position: "absolute",
        right: -420,
        bottom: 110,
        width: 840,
        height: 840,
        borderRadius: 840,
        border: "2px solid rgba(47,95,80,0.048)",
      }),
      div({
        position: "absolute",
        left: 76,
        right: 76,
        top: 74,
        bottom: 86,
        display: "flex",
        overflow: "hidden",
        borderRadius: 76,
        background: "rgba(255,253,248,0.86)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 34px 90px rgba(35,76,65,0.14)",
      }),
      div(
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: 145,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
        [
          div(
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 82,
              height: 82,
              borderRadius: 82,
              background: "rgba(47,95,80,0.08)",
              color: "#547D69",
              fontSize: 34,
              lineHeight: 1,
            },
            "❦"
          ),
          div(
            {
              display: "flex",
              marginTop: 22,
              color: "#234C41",
              fontSize: 38,
              lineHeight: 1.35,
              fontWeight: 500,
              letterSpacing: -0.4,
            },
            "أثر"
          ),
          div(
            {
              display: "flex",
              marginTop: 8,
              color: "rgba(35,76,65,0.58)",
              fontSize: 22,
              lineHeight: 1.45,
            },
            "خير يبقى، وأثر لا يزول"
          ),
        ]
      ),
      div(
        {
          position: "absolute",
          left: 108,
          right: 108,
          top: 390,
          bottom: 440,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
        div(
          {
            display: "flex",
            width: "100%",
            maxWidth: scale.maxWidth,
            minHeight: scale.minHeight,
            padding: "52px 36px 62px",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#1F463B",
            fontSize: scale.fontSize,
            lineHeight: scale.lineHeight,
            fontWeight: 500,
            letterSpacing: -0.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "visible",
          },
          text
        )
      ),
      div(
        {
          position: "absolute",
          left: 116,
          right: 116,
          bottom: 262,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
        [
          div(
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: 760,
              borderRadius: 999,
              background: "rgba(47,95,80,0.09)",
              border: "1px solid rgba(47,95,80,0.11)",
              padding: "12px 30px 16px",
              color: "#345F50",
              fontSize: 30,
              lineHeight: 1.65,
              fontWeight: 500,
            },
            sourceLabel
          ),
          name
            ? div(
                {
                  display: "flex",
                  marginTop: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(35,76,65,0.58)",
                  fontSize: 24,
                  lineHeight: 1.5,
                },
                `بأثر من ${name}`
              )
            : div({ display: "flex", width: 1, height: 1, opacity: 0 }, ""),
        ]
      ),
      div(
        {
          position: "absolute",
          left: 112,
          right: 112,
          bottom: 116,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          direction: "ltr",
        },
        [
          div(
            {
              display: "flex",
              width: 70,
              height: 70,
              borderRadius: 18,
              overflow: "hidden",
              opacity: 0.74,
              background: "#F7F1E6",
              padding: 7,
              border: "1px solid rgba(47,95,80,0.1)",
            },
            span(
              {
                display: "flex",
                width: 56,
                height: 56,
              },
              {
                type: "span",
                props: {
                  dangerouslySetInnerHTML: { __html: qrSvg },
                },
              }
            )
          ),
          div(
            {
              display: "flex",
              direction: "rtl",
              color: "rgba(35,76,65,0.5)",
              fontSize: 21,
              lineHeight: 1.4,
            },
            "athar-sandy.vercel.app"
          ),
        ]
      ),
    ]
  );
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const text = clean(req.body?.text, "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", 420);
    const source = clean(req.body?.source, "الرعد: 28", 80);
    const name = clean(req.body?.name, "", 28);
    const [regularFont, mediumFont, qrSvg] = await Promise.all([getRegularFont(), getMediumFont(), makeQrSvg()]);

    const svg = await satori(makeElement(text, source, name, qrSvg) as any, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "NotoNaskhArabic",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "NotoNaskhArabic",
          data: mediumFont,
          weight: 500,
          style: "normal",
        },
      ],
    });

    const png = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: WIDTH,
      },
      font: {
        loadSystemFonts: false,
      },
    })
      .render()
      .asPng();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'inline; filename="athar-story.png"');
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).send(Buffer.from(png));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to generate Athar image" });
  }
}
