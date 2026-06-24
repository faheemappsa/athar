const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export default function handler(_req: any, res: any) {
  const title = escapeXml("أثر");
  const subtitle = escapeXml("رفيق يومي للأذكار وورد القرآن ومشاركة الأثر");
  const dedication = escapeXml("عن مسلّم عوده البويني رحمه الله");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F9F3E8"/>
  <rect x="34" y="34" width="1132" height="562" rx="58" fill="url(#card)" stroke="rgba(35,76,64,0.10)"/>
  <circle cx="95" cy="45" r="290" fill="#FFFFFF" fill-opacity="0.70"/>
  <circle cx="1030" cy="585" r="390" stroke="#234C40" stroke-opacity="0.06" stroke-width="3"/>
  <circle cx="160" cy="560" r="250" stroke="#234C40" stroke-opacity="0.045" stroke-width="3"/>
  <rect x="500" y="104" width="200" height="200" rx="48" fill="#234C40"/>
  <text x="600" y="238" text-anchor="middle" direction="rtl" unicode-bidi="bidi-override" font-family="Arial, sans-serif" font-size="96" font-weight="800" fill="#F9F3E8">${title}</text>
  <text x="600" y="376" text-anchor="middle" direction="rtl" unicode-bidi="bidi-override" font-family="Arial, sans-serif" font-size="47" font-weight="800" fill="#244A3F" fill-opacity="0.92">${subtitle}</text>
  <rect x="352" y="420" width="496" height="60" rx="30" fill="#FFFFFF" fill-opacity="0.58"/>
  <text x="600" y="461" text-anchor="middle" direction="rtl" unicode-bidi="bidi-override" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#5C4B3A" fill-opacity="0.82">${dedication}</text>
  <text x="600" y="542" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#234C40" fill-opacity="0.62">athar-sandy.vercel.app</text>
  <defs>
    <linearGradient id="card" x1="34" y1="34" x2="1166" y2="596" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FBF8F0"/>
      <stop offset="0.55" stop-color="#F7F3E8"/>
      <stop offset="1" stop-color="#EAF4EE"/>
    </linearGradient>
  </defs>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");
  return res.status(200).send(svg);
}
