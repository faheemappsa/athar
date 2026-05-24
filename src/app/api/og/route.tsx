import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const text = searchParams.get('text') || 'أثر';
  const source = searchParams.get('source') || '';
  const theme = searchParams.get('theme') || 'emerald';

  const themes: Record<string, { bg: string; textColor: string }> = {
    emerald: {
      bg: 'linear-gradient(160deg, #0F2A1C 0%, #1B4332 45%, #2D6A4F 100%)',
      textColor: '#FFFFFF',
    },
    dawn: {
      bg: 'linear-gradient(160deg, #D4A373 0%, #B8875A 45%, #2D6A4F 100%)',
      textColor: '#FFFFFF',
    },
    midnight: {
      bg: 'linear-gradient(160deg, #0A0F0C 0%, #1A1F2E 60%, #111827 100%)',
      textColor: '#FFFFFF',
    },
    sand: {
      bg: 'linear-gradient(160deg, #F5F5F0 0%, #EDE8DC 60%, #D4A373 100%)',
      textColor: '#1B4332',
    },
  };

  const selectedTheme = themes[theme] || themes.emerald;

  const fontData = await fetch(
    new URL('/fonts/thmanyahsans-Medium.woff2', request.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: selectedTheme.bg,
          color: selectedTheme.textColor,
          fontFamily: 'Thmanyah',
          direction: 'rtl',
          textAlign: 'center',
          padding: '180px 90px',
        }}
      >
        <div
          style={{
            fontSize: 46,
            opacity: 0.72,
            marginBottom: 70,
          }}
        >
          أثر
        </div>

        <div
          style={{
            fontSize: 70,
            lineHeight: 1.7,
            fontWeight: 500,
            maxWidth: 900,
          }}
        >
          {text}
        </div>

        {source ? (
          <div
            style={{
              fontSize: 34,
              opacity: 0.72,
              marginTop: 44,
            }}
          >
            — {source}
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            fontSize: 24,
            opacity: 0.45,
            letterSpacing: 1.5,
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
    }
  );
}
