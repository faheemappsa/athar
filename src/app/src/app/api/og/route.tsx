import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'أثر';
  const source = searchParams.get('source') || '';
  const theme = searchParams.get('theme') || 'emerald';

  // الثيمات
  const themes: Record<string, { bg: string; textColor: string }> = {
    emerald: { bg: 'linear-gradient(160deg, #0F2A1C 0%, #1B4332 40%, #2D6A4F 100%)', textColor: 'white' },
    dawn: { bg: 'linear-gradient(160deg, #D4A373 0%, #B8875A 40%, #2D6A4F 100%)', textColor: 'white' },
    midnight: { bg: 'linear-gradient(160deg, #0A0F0C 0%, #1A1F2E 60%, #111827 100%)', textColor: 'white' },
    sand: { bg: 'linear-gradient(160deg, #F5F5F0 0%, #EDE8DC 60%, #D4A373 100%)', textColor: '#1B4332' },
  };

  const selectedTheme = themes[theme] || themes.emerald;

  // تحميل خط Thmanyah
  const fontData = await fetch(new URL('/fonts/thmanyahsans-Medium.woff2', request.url).toString()).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: selectedTheme.bg,
          color: selectedTheme.textColor,
          fontFamily: '"Thmanyah"',
          direction: 'rtl',
          padding: '200px 80px',
        }}
      >
        {/* زخرفة خفيفة (نقاط) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.05,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={selectedTheme.textColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* أيقونة صغيرة */}
        <div style={{ opacity: 0.6, marginBottom: '48px', fontSize: '64px' }}>✨</div>

        {/* النص الرئيسي */}
        <div
          style={{
            fontSize: '64px',
            lineHeight: 1.8,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '900px',
            textShadow: selectedTheme.textColor === 'white' ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {text}
        </div>

        {/* المصدر */}
        {source && (
          <div
            style={{
              fontSize: '36px',
              opacity: 0.7,
              marginTop: '32px',
              fontStyle: 'italic',
            }}
          >
            — {source}
          </div>
        )}

        {/* الرابط الصغير في الأسفل */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            fontSize: '24px',
            opacity: 0.4,
            letterSpacing: '0.1em',
          }}
        >
          athar.app
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        {
          name: 'Thmanyah',
          data: fontData,
          style: 'normal',
          weight: 500,
        },
      ],
    },
  );
}
