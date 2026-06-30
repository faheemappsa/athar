import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";

const WIDTH = 1080;
const HEIGHT = 1920;
const APP_URL = "https://athar-sandy.vercel.app";
const DISPLAY_URL = "athar.sa";
const FONT_URL = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf";

let fontData: ArrayBuffer | null = null;

const getFont = async () => {
  if (fontData) return fontData;

  const response = await fetch(FONT_URL);
  if (!response.ok) {
    throw new Error(`font_load_failed_${response.status}`);
  }

  fontData = await response.arrayBuffer();
  return fontData;
};

const normalizeText = (value: string) =>
  value
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clean = (value: unknown, fallback = "", maxLength = 420) => {
  if (typeof value !== "string") return fallback;
  const cleaned = normalizeText(value);
  return (cleaned || fallback).slice(0, maxLength);
};

const makeQrDataUrl = async () => {
  return QRCode.toDataURL(APP_URL, {
    margin: 1,
    width: 140,
    color: {
      dark: "#2F5F50",
      light: "#FFFDF8",
    },
    errorCorrectionLevel: "M",
  });
};

const getTextStyle = (text: string) => {
  const length = text.length;

  if (length > 260) return { fontSize: 43, lineHeight: 1.88, maxWidth: 850 };
  if (length > 210) return { fontSize: 49, lineHeight: 1.92, maxWidth: 850 };
  if (length > 160) return { fontSize: 57, lineHeight: 1.96, maxWidth: 840 };
  if (length > 105) return { fontSize: 66, lineHeight: 2.0, maxWidth: 820 };
  if (length > 58) return { fontSize: 76, lineHeight: 2.04, maxWidth: 790 };
  return { fontSize: 86, lineHeight: 2.08, maxWidth: 740 };
};

const div = (style: Record<string, unknown>, children?: unknown) => ({
  type: "div",
  props: {
    style,
    children,
  },
});

const makeElement = (text: string, source: string, name: string, qrDataUrl: string) => {
  const textStyle = getTextStyle(text);

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
        background: "linear-gradient(180deg, #F9F3E8 0%, #F7F1E6 54%, #EEF3EC 100%)",
      }),
      div({
        position: "absolute",
        left: -340,
        top: 135,
        width: 710,
        height: 710,
        borderRadius: 710,
        border: "2px solid rgba(47,95,80,0.045)",
      }),
      div({
        position: "absolute",
        right: -395,
        bottom: 165,
        width: 790,
        height: 790,
        borderRadius: 790,
        border: "2px solid rgba(47,95,80,0.04)",
      }),
      div({
        position: "absolute",
        left: 76,
        right: 76,
        top: 76,
        bottom: 76,
        borderRadius: 78,
        background: "rgba(255,253,248,0.92)",
        border: "2px solid rgba(255,255,255,0.72)",
        boxShadow: "0 34px 86px rgba(35,76,65,0.12)",
      }),
      div(
        {
          position: "absolute",
          top: 136,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        },
        [
          div(
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 68,
              background: "rgba(47,95,80,0.065)",
              color: "#547D69",
              fontSize: 30,
              lineHeight: 1,
            },
            "❦"
          ),
          div(
            {
              display: "flex",
              marginTop: 18,
              color: "#234C41",
              fontSize: 38,
              lineHeight: 1.4,
              fontWeight: 400,
            },
            "أثر"
          ),
          div(
            {
              display: "flex",
              marginTop: 6,
              color: "rgba(35,76,65,0.5)",
              fontSize: 22,
              lineHeight: 1.45,
            },
            "خير يبقى، وأثر لا يزول"
          ),
        ]
      ),
      div({
        position: "absolute",
        left: 310,
        right: 310,
        top: 352,
        height: 1,
        background: "rgba(47,95,80,0.08)",
      }),
      div(
        {
          position: "absolute",
          left: 118,
          right: 118,
          top: 400,
          height: 820,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        },
        div(
          {
            display: "flex",
            width: "100%",
            maxWidth: textStyle.maxWidth,
            padding: "48px 34px 58px",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#1F463B",
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight,
            fontWeight: 400,
            letterSpacing: -0.45,
            whiteSpace: "pre-wrap",
          },
          text
        )
      ),
      div(
        {
          position: "absolute",
          left: 116,
          right: 116,
          bottom: 395,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
              background: "rgba(47,95,80,0.075)",
              border: "1px solid rgba(47,95,80,0.095)",
              padding: "12px 32px 16px",
              color: "#345F50",
              fontSize: 30,
              lineHeight: 1.55,
              fontWeight: 400,
            },
            source || "أثر اليوم"
          ),
          name
            ? div(
                {
                  display: "flex",
                  marginTop: 18,
                  color: "rgba(35,76,65,0.54)",
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
          left: 190,
          right: 190,
          bottom: 305,
          height: 1,
          background: "rgba(47,95,80,0.11)",
        }
      ),
      div(
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 125,
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
              color: "#234C41",
              fontSize: 28,
              lineHeight: 1.35,
              fontWeight: 400,
            },
            "أثر"
          ),
          div(
            {
              display: "flex",
              marginTop: 4,
              color: "rgba(35,76,65,0.54)",
              fontSize: 21,
              lineHeight: 1.35,
            },
            DISPLAY_URL
          ),
          {
            type: "img",
            props: {
              src: qrDataUrl,
              width: 82,
              height: 82,
              style: {
                marginTop: 14,
                width: 82,
                height: 82,
                borderRadius: 14,
                opacity: 0.82,
              },
            },
          },
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
    const [font, qrDataUrl] = await Promise.all([getFont(), makeQrDataUrl()]);

    const svg = await satori(makeElement(text, source, name, qrDataUrl) as any, {
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
    res.setHeader("Content-Disposition", 'inline; filename="athar-story.png"');
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).send(Buffer.from(png));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.error("athar-image-error", message);
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(500).json({ error: "Unable to generate Athar image", reason: message });
  }
}
