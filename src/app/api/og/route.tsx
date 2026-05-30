import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "اللهم إني أسألك العفو والعافية";
  const source = searchParams.get("source") || "حديث صحيح";
  const theme = searchParams.get("theme") || "dawn";
  const mood = searchParams.get("mood") || "general";
  const appLink = "https://athar-sandy.vercel.app";

  const themes: Record<string, { bg: string; text: string; sub: string; accent: string }> = {
    emerald: { bg: "#0F2A1C", text: "#FFFFFF", sub: "#D4A373", accent: "#2D6A4F" },
    dawn: { bg: "#D4A373", text: "#1B4332", sub: "#FEFAE0", accent: "#B8875A" },
    midnight: { bg: "#0A0F0C", text: "#E5E7EB", sub: "#D4A373", accent: "#2D6A4F" },
    sand: { bg: "#F5F5F0", text: "#1B4332", sub: "#D4A373", accent: "#B8875A" },
  };
  const active = themes[theme] || themes.dawn;

  const moodIcon = () => {
    switch (mood) {
      case "happy": return "😊";
      case "sad": return "🤲";
      case "grateful": return "🙏";
      default: return "🌿";
    }
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: active.bg,
          color: active.text,
          direction: "rtl",
          textAlign: "center",
          padding: "80px 60px",
          position: "relative",
          fontFamily: "system-ui, 'Segoe UI', 'Cairo', sans-serif",
        }}
      >
        {/* أيقونة المزاج في الأعلى */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            fontSize: 52,
          }}
        >
          {moodIcon()}
        </div>

        {/* شعار التطبيق */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 40 }}>🌱</span>
          <span style={{ fontSize: 32, fontWeight: "bold", color: active.sub }}>أثر</span>
        </div>

        {/* النص الأساسي */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: "85%",
            marginBottom: 40,
          }}
        >
          {text}
        </div>

        {/* المصدر */}
        {source && (
          <div
            style={{
              fontSize: 32,
              color: active.sub,
              marginBottom: 60,
            }}
          >
            — {source}
          </div>
        )}

        {/* رابط التحميل (أهم عنصر للانتشار) */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 26,
            color: active.sub,
            backgroundColor: "rgba(0,0,0,0.1)",
            padding: "16px",
            margin: "0 50px",
            borderRadius: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>📲</span>
          <span>تطبيق أثر — حمل التطبيق الآن</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
