import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "اللهم إني أسألك العفو والعافية";
  const source = searchParams.get("source") || "حديث صحيح";
  const theme = searchParams.get("theme") || "dawn";
  const mood = searchParams.get("mood") || "general";

  const themes: Record<string, { bg: string; textColor: string; subColor: string }> = {
    emerald: { bg: "#0F2A1C", textColor: "#FFFFFF", subColor: "#D4A373" },
    dawn: { bg: "#D4A373", textColor: "#1B4332", subColor: "#FEFAE0" },
    midnight: { bg: "#0A0F0C", textColor: "#E5E7EB", subColor: "#D4A373" },
    sand: { bg: "#F5F5F0", textColor: "#1B4332", subColor: "#D4A373" },
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

  const appLink = "https://athar-sandy.vercel.app";

  // SVG مؤقت يتحول إلى PNG بواسطة sharp
  const svg = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${active.bg}" />
      <text x="950" y="150" font-size="80" text-anchor="end" fill="${active.subColor}">${moodIcon()}</text>
      <text x="130" y="150" font-size="70" fill="${active.subColor}" font-weight="bold">🌱 أثر</text>
      <text x="540" y="800" font-size="64" fill="${active.textColor}" text-anchor="middle" font-family="Arial, sans-serif" lang="ar" direction="rtl">
        <tspan x="540" dy="0">${text.substring(0, 30)}</tspan>
        ${text.length > 30 ? `<tspan x="540" dy="90">${text.substring(30, 60)}</tspan>` : ""}
        ${text.length > 60 ? `<tspan x="540" dy="90">${text.substring(60, 90)}</tspan>` : ""}
      </text>
      <text x="540" y="1200" font-size="48" fill="${active.subColor}" text-anchor="middle">— ${source}</text>
      <rect x="100" y="1750" width="880" height="90" rx="45" fill="rgba(0,0,0,0.1)" />
      <text x="540" y="1810" font-size="40" fill="${active.subColor}" text-anchor="middle" font-weight="bold">📲 تطبيق أثر — حمل التطبيق الآن</text>
      <text x="540" y="1880" font-size="28" fill="${active.subColor}" text-anchor="middle" opacity="0.6">وقف خيري لمسلم عوده البويني رحمه الله</text>
    </svg>
  `;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
