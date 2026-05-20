const clock = document.getElementById('clock');
const nextPrayer = document.getElementById('nextPrayer');
const prayerCountdown = document.getElementById('prayerCountdown');
const cardType = document.getElementById('cardType');
const cardText = document.getElementById('cardText');
const cardSource = document.getElementById('cardSource');
const sizeSelect = document.getElementById('sizeSelect');
const previewCard = document.getElementById('previewCard');

let currentKind = 'ayah';

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

setInterval(updateClock, 1000);
updateClock();

function randomItem(kind) {
  const items = window.ATHAR_CONTENT[kind];
  return items[Math.floor(Math.random() * items.length)];
}

function applyContent(kind) {
  const item = randomItem(kind);
  cardType.textContent = kind === 'ayah' ? 'آية' : kind === 'hadith' ? 'حديث' : 'ذكر';
  cardText.textContent = item.text;
  cardSource.textContent = item.source;
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

document.getElementById('shuffleBtn').addEventListener('click', () => {
  applyContent(currentKind);
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  alert('ميزة التصدير الفعلي ستكون بالمرحلة التالية بعد دمج الخلفيات والخطوط الرسمية.');
});

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`);
      const data = await response.json();
      const timings = data.data.timings;
      nextPrayer.textContent = 'الصلاة القادمة';
      prayerCountdown.textContent = `${timings.Maghrib} المغرب`;
    } catch (e) {
      prayerCountdown.textContent = 'تعذر تحميل المواقيت';
    }
  });
}
