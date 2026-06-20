export async function generateShareImage(athar) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // خلفية متدرجة
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0a0a14');
  gradient.addColorStop(0.5, '#121026');
  gradient.addColorStop(1, '#0d0d1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // إطار ذهبي
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // زخارف صغيرة في الزوايا
  ctx.fillStyle = 'rgba(201, 168, 76, 0.3)';
  [
    [40, 40],
    [canvas.width - 40, 40],
    [40, canvas.height - 40],
    [canvas.width - 40, canvas.height - 40]
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // النص الرئيسي
  ctx.fillStyle = '#f0e6c8';
  ctx.font = 'bold 52px "Noto Kufi Arabic", sans-serif';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';

  const lines = wrapText(ctx, athar.text, canvas.width - 200);
  let y = 350;
  lines.forEach(line => {
    ctx.fillText(line, canvas.width / 2, y);
    y += 80;
  });

  // المرجع
  ctx.fillStyle = 'rgba(201, 168, 76, 0.8)';
  ctx.font = '36px "Noto Kufi Arabic", sans-serif';
  ctx.fillText(athar.reference, canvas.width / 2, y + 40);

  if (athar.page) {
    ctx.fillStyle = 'rgba(201, 168, 76, 0.5)';
    ctx.font = '28px "Noto Kufi Arabic", sans-serif';
    ctx.fillText(`صفحة ${athar.page}`, canvas.width / 2, y + 90);
  }

  // التوقيع
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '28px "Noto Kufi Arabic", sans-serif';
  ctx.fillText('من موقع أثر - وقف عن مسلم عوده البويني رحمه الله', canvas.width / 2, canvas.height - 80);

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  words.forEach(word => {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}
