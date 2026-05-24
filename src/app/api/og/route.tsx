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
      bg: 'linear-gradient(160deg, #0F2A1C 0%, #1B4332 40%, #2D6A4F 100%)',
      textColor: 'white',
    },
    dawn: {
      bg: 'linear-gradient(160deg, #D4A373 0%, #B8875A 40%, #2D6A4F 100%)',
      textColor: 'white',
    },
    midnight: {
      bg: 'linear-gradient(160deg, #0A0F0C 0%, #1A1F2E 60%, #111827 100%)',
      textColor: 'white',
    },
    sand: {
      bg: 'linear-gradient(160deg, #F5F5F0 0%, #EDE8DC 60%, #D4A373 100%)',
      textColor: '#1B4332',
    },
  };

  const selectedTheme = themes[theme] || themes.emerald;

  const fontUrl = new URL(
    '../../../fonts/thmanyahsans-Medium.woff2',
    import.meta.url
  );

  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: selectedTheme.bg,
          color: selectedTheme.textColor,
          fontFamily: 'Thmanyah',
          direction: 'rtl',
          padding: '120px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            opacity: 0.5,
            fontSize: 64,
            marginBottom: 40,
          }}
        >
          ✨
        </div>

        <div
          style={{
            fontSize: 64,
            lineHeight: 1.8,
            maxWidth: 900,
            fontWeight: 500,
          }}
        >
          {text}
        </div>

        {source && (
          <div
            style={{
              marginTop: 32,
              fontSize: 36,
              opacity: 0.7,
            }}
          >
            — {source}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 60,
            fontSize: 24,
            opacity: 0.4,
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
          weight: 500,
          style: 'normal',
        },
      ],
    }
  );
}
