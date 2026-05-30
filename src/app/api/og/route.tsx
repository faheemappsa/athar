import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "اللهم إني أسألك العفو والعافية";
  const source = searchParams.get("source") || "حديث صحيح";
  const theme = searchParams.get("theme") || "dawn";
  const mood = searchParams.get("mood") || "general";

  // الثيمات المحسنة مع ألوان متناغمة
  const themes: Record<string, { bg: string; textColor: string; accentColor: string; subColor: string }> = {
    emerald: { bg: "#0F2A1C", textColor: "#FFFFFF", accentColor: "#2D6A4F", subColor: "#D4A373" },
    dawn: { bg: "#D4A373", textColor: "#1B4332", accentColor: "#B8875A", subColor: "#FEFAE0" },
    midnight: { bg: "#0A0F0C", textColor: "#E5E7EB", accentColor: "#2D6A4F", subColor: "#D4A373" },
    sand: { bg: "#F5F5F0", textColor: "#1B4332", accentColor: "#B8875A", subColor: "#D4A373" },
  };
  const active = themes[theme] || themes.dawn;

  // أيقونة تعبر عن المزاج
  const moodIcon = () => {
    switch (mood) {
      case "happy": return "😊";
      case "sad": return "🤲";
      case "grateful": return "🙏";
      default: return "🌿";
    }
  };

  // رابط التحميل الذي سيظهر في الصورة
  const appLink = "https://athar-sandy.vercel.app";

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
          color: active.textColor,
          direction: "rtl",
          textAlign: "center",
          padding: "80px 60px",
          position: "relative",
          fontFamily: "system-ui, 'Cairo', 'Segoe UI', sans-serif",
        }}
      >
        {/* أيقونة المزاج (أعلى يمين) */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            fontSize: 64,
          }}
        >
          {moodIcon()}
        </div>

        {/* شعار التطبيق (أعلى يسار) */}
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
          <span style={{ fontSize: 48 }}>🌱</span>
          <span style={{ fontSize: 36, fontWeight: "bold", color: active.subColor }}>أثر</span>
        </div>

        {/* النص الأساسي (الذكر/الآية) - مع دعم الأسطر الطويلة */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: "90%",
            marginBottom: 40,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>

        {/* المصدر */}
        {source && (
          <div
            style={{
              fontSize: 34,
              color: active.subColor,
              marginBottom: 70,
            }}
          >
            — {source}
          </div>
        )}

        {/* شريط رابط التحميل (أسفل الصورة) */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 28,
            color: active.subColor,
            backgroundColor: "rgba(0,0,0,0.08)",
            padding: "16px",
            margin: "0 50px",
            borderRadius: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>📲</span>
          <span style={{ fontWeight: 500 }}>تطبيق أثر — حمل التطبيق الآن</span>
          <span style={{ fontSize: 24, opacity: 0.8 }}>🔗</span>
        </div>

        {/* إضافة نص صغير للوقف الخيري (اختياري) أسفل الشريط */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            fontSize: 18,
            color: active.subColor,
            opacity: 0.6,
          }}
        >
          وقف خيري لمسلم عوده البويني رحمه الله
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
