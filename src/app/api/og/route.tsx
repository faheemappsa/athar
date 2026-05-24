import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const text = searchParams.get('text') || 'أثر';
  const source = searchParams.get('source') || '';
  const theme = searchParams.get('theme') || 'emerald';

  const themes: Record<string, { bg: string; text: string; sub: string }> = {
    emerald: { bg: '#123C2A', text: '#FFFFFF', sub: '#D8C49A' },
    dawn: { bg: '#B8875A', text: '#FFFFFF', sub: '#F6E7D0' },
    midnight: { bg: '#0A0F0C', text: '#FFFFFF', sub: '#A8C7B0' },
    sand: { bg: '#F5F1E8', text: '#123C2A', sub: '#B8875A' },
  };

  const t = themes[theme] || themes.emerald;

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
          background: t.bg,
          color: t.text,
          direction: 'rtl',
          textAlign: 'center',
          padding: '170px 90px',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        <div style={{ position: 'absolute', top: 90, fontSize: 58, color: t.sub }}>
          أثَر
        </div>

        <div
          style={{
            fontSize: 74,
            lineHeight: 1.75,
            maxWidth: 900,
          }}
        >
          {text}
        </div>

        {source ? (
          <div style={{ fontSize: 34, color: t.sub, marginTop: 45 }}>
            — {source}
          </div>
        ) : null}

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            fontSize: 28,
            color: t.sub,
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
