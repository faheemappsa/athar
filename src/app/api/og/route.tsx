import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#123C2A',
          color: 'white',
          fontSize: 80,
          fontFamily: 'Arial',
        }}
      >
        ATHAR TEST
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
