const clock = document.getElementById('clock');
const nextPrayer = document.getElementById('nextPrayer');
const prayerCountdown = document.getElementById('prayerCountdown');
const locationLabel = document.getElementById('locationLabel');
const cardType = document.getElementById('cardType');
const cardText = document.getElementById('cardText');
const cardSource = document.getElementById('cardSource');
const sizeSelect = document.getElementById('sizeSelect');
const previewCard = document.getElementById('previewCard');
const exportCanvas = document.getElementById('exportCanvas');

let currentKind = 'ayah';
let activePrayerSchedule = null;
let currentItem = null;

const prayerNames = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const exportSizes = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 }
};

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  updateNextPrayer();
}

setInterval(updateClock, 1000);
updateClock();

function randomItem(kind) {
  const items = window.ATHAR_CONTENT[kind];
  return items[Math.floor(Math.random() * items.length)];
}

function applyContent(kind) {
  currentItem = randomItem(kind);
  cardType.textContent = kind === 'ayah' ? 'آية' : kind === 'hadith' ? 'حديث' : 'ذكر';
  cardText.textContent = currentItem.text;
  cardSource.textContent = currentItem.source;
}

applyContent(currentKind);

Array.from(document.querySelectorAll('.segment')).forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.segment.active')?.classList.remove('active');
    btn.classList.add('active');
    currentKind = btn.dataset.kind;
    applyContent(currentKind);
  });
});

sizeSelect.addEventListener('change', () => {
  previewCard.dataset.ratio = sizeSelect.value;
});

document.getElementById('shuffleBtn').addEventListener('click', () => applyContent(currentKind));

document.getElementById('exportBtn').addEventListener('click', exportCardImage);

function parsePrayerTime(timeText, baseDate = new Date()) {
  const clean = String(timeText).split(' ')[0];
  const [hours, minutes] = clean.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function loadPrayerTimes(latitude, longitude) {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=4&school=0`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Prayer API failed');
    const json = await response.json();
    const timings = json.data.timings;

    activePrayerSchedule = Object.keys(prayerNames).map(key => ({
      key,
      name: prayerNames[key],
      time: parsePrayerTime(timings[key])
    }));

    locationLabel.textContent = 'الصلاة القادمة حسب موقعك';
    updateNextPrayer();
  } catch (error) {
    nextPrayer.textContent = 'تعذر التحديد';
    prayerCountdown.textContent = 'تحقق من السماح بالموقع أو الاتصال بالإنترنت';
  }
}

function updateNextPrayer() {
  if (!activePrayerSchedule) return;

  const now = new Date();
  let next = activePrayerSchedule.find(prayer => prayer.time > now);

  if (!next) {
    const tomorrowFajr = new Date(activePrayerSchedule[0].time);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    next = { ...activePrayerSchedule[0], time: tomorrowFajr };
  }

  const diffMs = next.time - now;
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const prayerTime = next.time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  nextPrayer.textContent = next.name;
  prayerCountdown.textContent = hours > 0 ? `بعد ${hours} س و ${minutes} د • ${prayerTime}` : `بعد ${minutes} د • ${prayerTime}`;
}

function requestLocation() {
  if (!('geolocation' in navigator)) {
    nextPrayer.textContent = 'الموقع غير مدعوم';
    prayerCountdown.textContent = 'جهازك لا يدعم تحديد الموقع من المتصفح';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => loadPrayerTimes(position.coords.latitude, position.coords.longitude),
    () => {
      nextPrayer.textContent = 'فعّل الموقع';
      prayerCountdown.textContent = 'اسمح للموقع من المتصفح لعرض الصلاة القادمة بدقة';
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 10 * 60 * 1000 }
  );
}

requestLocation();

function wrapArabicText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) lines.push(line);
  return lines;
}

async function exportCardImage() {
  const size = exportSizes[sizeSelect.value] || exportSizes.story;
  const canvas = exportCanvas;
  const scale = 1;
  canvas.width = size.width * scale;
  canvas.height = size.height * scale;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
  gradient.addColorStop(0, '#f0dac0');
  gradient.addColorStop(0.34, '#7a4d3a');
  gradient.addColorStop(1, '#17100d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.globalAlpha = 0.18;
  for (let x = 0; x < size.width; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + size.height * 0.35, size.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const vignette = ctx.createRadialGradient(size.width / 2, size.height / 2, size.width * 0.15, size.width / 2, size.height / 2, size.height * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.48)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.textAlign = 'right';
  ctx.direction = 'rtl';
  ctx.fillStyle = 'rgba(255,244,230,0.78)';
  ctx.font = '44px AtharDisplay, Tajawal, sans-serif';
  ctx.fillText(cardType.textContent, size.width - 92, 170);

  const baseFont = size.height > 1400 ? 82 : 68;
  ctx.font = `800 ${baseFont}px AtharDisplay, Tajawal, sans-serif`;
  ctx.fillStyle = '#fff5e8';
  const lines = wrapArabicText(ctx, cardText.textContent, size.width - 184);
  const lineHeight = baseFont * 1.75;
  let y = size.height * 0.34;
  lines.forEach(line => {
    ctx.fillText(line, size.width - 92, y);
    y += lineHeight;
  });

  ctx.font = '42px AtharDisplay, Tajawal, sans-serif';
  ctx.fillStyle = 'rgba(255,239,217,0.82)';
  ctx.fillText(cardSource.textContent, size.width - 92, y + 26);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(92, size.height - 188);
  ctx.lineTo(size.width - 92, size.height - 188);
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.font = '800 48px AtharDisplay, Tajawal, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillText('أثر', size.width - 92, size.height - 112);
  ctx.font = '31px AtharDisplay, Tajawal, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.70)';
  ctx.fillText('athar-sandy.vercel.app', size.width - 92, size.height - 66);

  ctx.textAlign = 'left';
  ctx.font = '30px AtharDisplay, Tajawal, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.66)';
  ctx.fillText('وقف خيري عن مسلّم عوده البويني', 92, size.height - 92);

  canvas.toBlob(async blob => {
    if (!blob) return;
    const file = new File([blob], 'athar-card.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'أثر', text: 'بطاقة من أثر' });
      return;
    }

    const link = document.createElement('a');
    link.download = 'athar-card.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png', 1);
}
