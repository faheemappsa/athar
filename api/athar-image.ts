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
    margin: 0,
    width: 120,
    color: {
      dark: "#2F5F50",
      light: "#F7F1E6",
    },
    errorCorrectionLevel: "M",
  });
};

const getTextStyle = (text: string) => {
  const length = text.length;

  if (length > 260) return { fontSize: 44, lineHeight: 1.88, maxWidth: 850 };
  if (length > 210) return { fontSize: 50, lineHeight: 1.92, maxWidth: 850 };
  if (length > 160) return { fontSize: 58, lineHeight: 1.96, maxWidth: 840 };
  if (length > 105) return { fontSize: 68, lineHeight: 2.0, maxWidth: 820 };
  if (length > 58) return { fontSize: 78, lineHeight: 2.04, maxWidth: 790 };
  return { fontSize: 88, lineHeight: 2.08, maxWidth: 740 };
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
        left: -330,
        top: 120,
        width: 720,
        height: 720,
        borderRadius: 720,
        border: "2px solid rgba(47,95,80,0.055)",
      }),
      div({
        position: "absolute",
        right: -380,
        bottom: 150,
        width: 780,
        height: 780,
        borderRadius: 780,
        border: "2px solid rgba(47,95,80,0.05)",
      }),
      div({
        position: "absolute",
        left: 76,
        right: 76,
        top: 76,
        bottom: 86,
        borderRadius: 76,
        background: "rgba(255,253,248,0.9)",
        border: "2px solid rgba(255,255,255,0.72)",
        boxShadow: "0 34px 90px rgba(35,76,65,0.14)",
      }),
      div(
        {
          position: "absolute",
          top: 138,
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
              width: 76,
              height: 76,
              borderRadius: 76,
              background: "rgba(47,95,80,0.08)",
              color: "#547D69",
              fontSize: 32,
              lineHeight: 1,
            },
            "❦"
          ),
          div(
            {
              display: "flex",
              marginTop: 22,
              color: "#234C41",
              fontSize: 40,
              lineHeight: 1.4,
              fontWeight: 400,
            },
            "أثر"
          ),
          div(
            {
              display: "flex",
              marginTop: 8,
              color: "rgba(35,76,65,0.58)",
              fontSize: 23,
              lineHeight: 1.45,
            },
            "خير يبقى، وأثر لا يزول"
          ),
        ]
      ),
      div(
        {
          position: "absolute",
          left: 118,
          right: 118,
          top: 390,
          height: 890,
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
            padding: "66px 34px 76px",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#1F463B",
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight,
            fontWeight: 400,
            letterSpacing: -0.55,
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
          bottom: 280,
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
              background: "rgba(47,95,80,0.09)",
              border: "1px solid rgba(47,95,80,0.11)",
              padding: "13px 32px 17px",
              color: "#345F50",
              fontSize: 31,
              lineHeight: 1.55,
              fontWeight: 400,
            },
            source || "أثر اليوم"
          ),
          name
            ? div(
                {
                  display: "flex",
                  marginTop: 20,
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
          justifyContent: "center",
        },
        [
          {
            type: "img",
            props: {
              src: qrDataUrl,
              width: 72,
              height: 72,
              style: {
                width: 72,
                height: 72,
                borderRadius: 16,
                opacity: 0.74,
              },
            },
          },
          div(
            {
              display: "flex",
              marginRight: 18,
              color: "rgba(35,76,65,0.48)",
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
