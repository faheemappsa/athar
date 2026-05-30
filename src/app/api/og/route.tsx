import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || "اللهم ارحم مسلم عوده البويني واغفر له";
    const source = searchParams.get("source") || "دعاء";
    const type = searchParams.get("type") || "dua";
    const mood = searchParams.get("mood") || "general";

    // خلفية حسب نوع المحتوى (بدون ثيمات معقدة)
    const getBackground = () => {
      if (type === "quran") return "linear-gradient(135deg, #0F2A1C 0%, #1B4332 100%)";
      if (type === "hadith") return "linear-gradient(135deg, #4A2A1A 0%, #7A4A2A 100%)";
      return "linear-gradient(135deg, #1A3A5C 0%, #2A5A8C 100%)";
    };

    // أيقونة بسيطة للمزاج (اختيارية)
    const moodEmoji = {
      happy: "🤲",
      sad: "🌱",
      grateful: "🙏",
      general: "🌿",
    }[mood] || "🌿";

    // قص النص الطويل
    const displayText = text.length > 280 ? text.substring(0, 277) + "..." : text;

    return new ImageResponse(
      (
        <div
          style={{
            width: 1080,
            height: 1920,
            background: getBackground(),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "80px",
            fontFamily: "system-ui, 'Segoe UI', 'Cairo', sans-serif",
            direction: "rtl",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* أيقونة المزاج (اختيارية، صغيرة في الأعلى) */}
          <div style={{ position: "absolute", top: 60, right: 60, fontSize: 48, opacity: 0.6 }}>
            {moodEmoji}
          </div>

          {/* المنطقة العلوية: هوية أثر */}
          <div style={{ width: "100%", marginTop: 40 }}>
            <p style={{ fontSize: 36, color: "rgba(255,255,255,0.7)", marginBottom: 40, letterSpacing: 2 }}>
              أثر
            </p>
            <div style={{ width: 60, height: 2, background: "rgba(255,255,255,0.3)", margin: "0 auto" }} />
          </div>

          {/* المنطقة الوسطى: الرسالة الرئيسية */}
          <div style={{ width: "100%", marginTop: -40 }}>
            <p
              style={{
                fontSize: 56,
                fontWeight: "bold",
                color: "white",
                lineHeight: 1.5,
                marginBottom: 40,
                textShadow: "0 2px 15px rgba(0,0,0,0.3)",
              }}
            >
              {displayText}
            </p>
            <p style={{ fontSize: 32, color: "rgba(255,255,255,0.85)", fontWeight: "normal" }}>
              — {source}
            </p>
          </div>

          {/* المنطقة السفلية: توقيع ورابط خفي */}
          <div style={{ width: "100%", marginBottom: 40 }}>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.2)", margin: "0 auto 40px auto" }} />
            <p style={{ fontSize: 28, color: "rgba(255,255,255,0.6)" }}>أثر — صدقة جارية ودعاء لا ينقطع</p>
            <p style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>athar-app.com</p>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("فشل إنشاء الصورة", { status: 500 });
  }
}
