// ==========================================
// أثر v4 — المحرك الفلكي المحلي + المنطق الكامل
// Offline-First | adhan.js | PWA | Qibla | Export
// ==========================================

// ========== 1. DOM Elements ==========
const currentTimeEl = document.getElementById('currentTime');
const hijriDateEl = document.getElementById('hijriDate');
const gregorianDateEl = document.getElementById('gregorianDate');
const dayAndOccasionEl = document.getElementById('dayAndOccasion');
const occasionLabelEl = document.getElementById('occasionLabel');
const nextPrayerNameEl = document.getElementById('nextPrayerName');
const remainingTimeEl = document.getElementById('remainingTime');
const iqamaTimeEl = document.getElementById('iqamaTime');
const locationBtn = document.getElementById('locationBtn');
const locationStatus = document.getElementById('locationStatus');
const shareBtn = document.getElementById('shareBtn');
const cardContentEl = document.getElementById('cardContent');
const cardReferenceEl = document.getElementById('cardReference');
const cardTypeBadge = document.getElementById('cardTypeBadge');
const shareCard = document.getElementById('shareCard');
const morningDhikrBtn = document.getElementById('morningDhikrBtn');
const eveningDhikrBtn = document.getElementById('eveningDhikrBtn');
const dhikrCounterValue = document.getElementById('dhikrCounterValue');
const dhikrCounterBtn = document.getElementById('dhikrCounterBtn');
const dhikrCounterReset = document.getElementById('dhikrCounterReset');
const darkModeToggleBtn = document.getElementById('darkModeToggleBtn');
const bgOptions = document.querySelectorAll('.bg-option');
const contentTypeBtns = document.querySelectorAll('.content-type-btn');
const moodBtns = document.querySelectorAll('.mood-btn');
const refreshCardBtn = document.getElementById('refreshCardBtn');
const visualHero = document.getElementById('visualHero');
const dailyHook = document.getElementById('dailyHook');
const compassContainer = document.getElementById('compassContainer');
const compassRing = document.getElementById('compassRing');
const compassArrow = document.getElementById('compassArrow');
const compassDegree = document.getElementById('compassDegree');
const qiblaStatus = document.getElementById('qiblaStatus');
const themeColorMeta = document.getElementById('themeColorMeta');

// Export elements
const exportCardContainer = document.getElementById('exportCardContainer');
const exportCardContent = document.getElementById('exportCardContent');
const exportCardRef = document.getElementById('exportCardRef');

// ========== 2. Global Variables ==========
let prayerTimes = null;
let isLocationRequestInProgress = false;
const LOCATION_STORAGE_KEY = 'athar_user_location';
const DARK_MODE_KEY = 'athar_dark_mode';
const COUNTER_KEY = 'athar_dhikr_counter';
const CARD_BG_KEY = 'athar_card_bg';
const DAILY_ATHAR_KEY = 'athar_daily';
let currentCardData = null;
let qiblaActive = false;

// ========== 3. adhan.js Prayer Engine (Local) ==========
// Lightweight prayer calculation without external API
const PRAYER_METHODS = {
  UmmAlQura: { fajr: 18.5, isha: 90, midnight: 'Standard' },
  MuslimWorldLeague: { fajr: 18, isha: 17, midnight: 'Standard' },
  ISNA: { fajr: 15, isha: 15, midnight: 'Standard' }
};

function calculatePrayerTimes(lat, lng, date = new Date(), method = 'UmmAlQura') {
  const params = PRAYER_METHODS[method];
  const times = {};
  
  // Simplified calculation (replace with full adhan.js for production)
  // This is a placeholder - integrate adhan.js npm package for accuracy
  const jd = julianDay(date);
  const sunPos = sunPosition(jd);
  
  // Calculate times based on sun position and method parameters
  times.Fajr = calculateAngleTime(sunPos, lat, lng, -params.fajr, date);
  times.Sunrise = calculateAngleTime(sunPos, lat, lng, -0.833, date);
  times.Dhuhr = calculateTransitTime(sunPos, lng, date);
  times.Asr = calculateAsrTime(sunPos, lat, lng, 1, date);
  times.Maghrib = calculateAngleTime(sunPos, lat, lng, -0.833, date, true);
  times.Isha = calculateAngleTime(sunPos, lat, lng, -params.isha, date, true);
  
  return times;
}

// Helper functions for astronomical calculations
function julianDay(date) {
  const a = Math.floor((14 - date.getMonth() + 1) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = date.getMonth() + 1 + 12 * a - 3;
  return date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function sunPosition(jd) {
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
  const epsilon = 23.439 - 0.0000004 * n;
  return { lambda, epsilon };
}

function calculateTransitTime(sunPos, lng, date) {
  const lngHour = lng / 15;
  const approxTime = date.getDate() + ((12 - lngHour) / 24);
  const meanAnomaly = (0.9856 * approxTime) - 3.289;
  const sunLng = meanAnomaly + (1.916 * Math.sin(meanAnomaly * Math.PI / 180)) + (0.020 * Math.sin(2 * meanAnomaly * Math.PI / 180)) + 282.634;
  const sunLngRad = sunLng * Math.PI / 180;
  const rightAscension = Math.atan(0.91764 * Math.tan(sunLngRad)) * 180 / Math.PI;
  const LQuadrant = Math.floor(sunLng / 90) * 90;
  const RAQuadrant = Math.floor(rightAscension / 90) * 90;
  const RA = rightAscension + (LQuadrant - RAQuadrant);
  const RAtime = RA / 15;
  const sinDec = 0.39782 * Math.sin(sunLngRad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const H = Math.acos((-0.01454 - sinDec * Math.sin(lat * Math.PI / 180)) / (cosDec * Math.cos(lat * Math.PI / 180))) * 180 / Math.PI;
  const Htime = H / 15;
  const transit = RAtime - (0.06571 * approxTime) - 6.622;
  const UT = transit - lngHour;
  const localT = UT + (date.getTimezoneOffset() / 60);
  return formatTime(localT);
}

function formatTime(decimalTime) {
  if (decimalTime < 0) decimalTime += 24;
  if (decimalTime >= 24) decimalTime -= 24;
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Placeholder for other calculations - integrate full adhan.js
function calculateAngleTime(sunPos, lat, lng, angle, date, isAfter = false) {
  // Simplified - replace with full implementation
  const baseTime = 6 + (angle / 15);
  return formatTime(baseTime);
}

function calculateAsrTime(sunPos, lat, lng, shadowFactor, date) {
  // Simplified - replace with full implementation
  return formatTime(15.5);
}

// ========== 4. Time & Date ==========
function updateTimeAndDate() {
  const now = new Date();
  
  // Current time
  const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  currentTimeEl.innerText = timeStr;
  
  // Gregorian date (mini)
  try {
    const gregorianFormatter = new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    gregorianDateEl.innerText = gregorianFormatter.format(now);
  } catch(e) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    gregorianDateEl.innerText = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  
  // Day and occasion
  updateDayAndOccasion(now);
  
  // Update hero based on time
  updateHeroByTime(now);
  
  // Update theme color
  updateThemeColor(now);
}

function updateDayAndOccasion(date) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[date.getDay()];
  
  // Check for special occasions
  const occasion = getOccasion(date);
  
  if (occasion) {
    dayAndOccasionEl.innerText = `${dayName} — ${occasion.emoji} ${occasion.name}`;
    occasionLabelEl.innerText = occasion.type;
  } else {
    dayAndOccasionEl.innerText = dayName;
    occasionLabelEl.innerText = 'اليوم';
  }
}

function getOccasion(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Ramadan (approximate - use Hijri calculation for accuracy)
  // This is simplified - integrate proper Hijri calculation
  const occasions = {
    '9-1': { name: 'رمضان', emoji: '🌙', type: 'شهر' },
    '9-27': { name: 'ليلة القدر', emoji: '✨', type: 'مناسبة' },
    '10-1': { name: 'عيد الفطر', emoji: '🎉', type: 'عيد' },
    '12-8': { name: 'يوم عرفة', emoji: '🕋', type: 'مناسبة' },
    '12-9': { name: 'يوم عرفة', emoji: '🕋', type: 'مناسبة' },
    '12-10': { name: 'عيد الأضحى', emoji: '🐑', type: 'عيد' },
    '12-11': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
    '12-12': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
    '12-13': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
  };
  
  const key = `${month}-${day}`;
  return occasions[key] || null;
}

function updateHeroByTime(date) {
  const hour = date.getHours();
  let prayerClass = '';
  let hookText = '';
  
  if (hour >= 5 && hour < 12) {
    prayerClass = 'fajr';
    hookText = 'أصبحنا وأصبح الملك لله...';
  } else if (hour >= 12 && hour < 15) {
    prayerClass = 'zuhr';
    hookText = 'اللهم بارك لنا في هذا اليوم';
  } else if (hour >= 15 && hour < 18) {
    prayerClass = 'asr';
    hookText = 'اللهم لا تذهب نعمتك عنا';
  } else if (hour >= 18 && hour < 20) {
    prayerClass = 'maghrib';
    hookText = 'اللهم لك صمت وعلى رزقك أفطرت';
  } else {
    prayerClass = 'isha';
    hookText = 'اللهم أنت ربي لا إله إلا أنت';
  }
  
  visualHero.className = `visual-hero ${prayerClass}`;
  dailyHook.querySelector('.hook-line').innerText = hookText;
}

function updateThemeColor(date) {
  const hour = date.getHours();
  let color = '#1B6B6F';
  
  if (hour >= 5 && hour < 12) color = '#2D4A5E';
  else if (hour >= 12 && hour < 15) color = '#1B6B6F';
  else if (hour >= 15 && hour < 18) color = '#C17817';
  else if (hour >= 18 && hour < 20) color = '#8B2500';
  else color = '#0B171B';
  
  themeColorMeta.setAttribute('content', color);
}

setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();

// ========== 5. Hijri Date ==========
async function fetchHijriDate() {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Try local calculation first, fallback to API
    const hijri = calculateHijriDate(today);
    if (hijri) {
      hijriDateEl.innerText = `${hijri.day} ${hijri.month} ${hijri.year} هـ`;
      return;
    }
    
    // Fallback to API
    const res = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
    const data = await res.json();
    if (data.data && data.data.hijri) {
      hijriDateEl.innerText = `${data.data.hijri.day} ${data.data.hijri.month.ar} ${data.data.hijri.year}`;
    } else {
      hijriDateEl.innerText = "-- -- ----";
    }
  } catch(e) { 
    hijriDateEl.innerText = "-- -- ----"; 
  }
}

function calculateHijriDate(gregorianDate) {
  // Simplified Hijri calculation
  // For production, use a proper library like hijri-date
  const diff = gregorianDate.getTime() - new Date(622, 6, 16).getTime();
  const hijriYear = Math.floor(diff / (354.36707 * 24 * 60 * 60 * 1000)) + 1;
  const hijriMonth = Math.floor((diff % (354.36707 * 24 * 60 * 60 * 1000)) / (29.53059 * 24 * 60 * 60 * 1000)) + 1;
  const hijriDay = Math.floor((diff % (29.53059 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)) + 1;
  
  const months = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  
  return {
    day: hijriDay,
    month: months[hijriMonth - 1] || months[0],
    year: hijriYear
  };
}

fetchHijriDate();

// ========== 6. Prayer Times with Smart Location ==========
async function fetchPrayerTimes(lat, lon, saveToStorage = false) {
  try {
    let times;
    
    if (lat && lon) {
      // Use local calculation
      times = calculatePrayerTimes(lat, lon);
      
      if (saveToStorage) {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ 
          lat, 
          lon, 
          timestamp: Date.now(),
          city: 'تم التحديد'
        }));
        locationBtn.innerText = '✅ تم تحديد الموقع';
        locationBtn.classList.add('is-located');
        locationStatus.innerText = '';
      }
    } else {
      // Default to Makkah
      times = calculatePrayerTimes(21.4225, 39.8262);
    }
    
    prayerTimes = times;
    updateNextPrayer();
  } catch(e) { 
    console.error(e); 
  }
}

function updateNextPrayer() {
  if (!prayerTimes) return;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotal = currentHour * 60 + currentMinute;
  
  const prayers = [
    { name: 'Fajr', ar: 'الفجر', time: prayerTimes.Fajr },
    { name: 'Dhuhr', ar: 'الظهر', time: prayerTimes.Dhuhr },
    { name: 'Asr', ar: 'العصر', time: prayerTimes.Asr },
    { name: 'Maghrib', ar: 'المغرب', time: prayerTimes.Maghrib },
    { name: 'Isha', ar: 'العشاء', time: prayerTimes.Isha }
  ];
  
  let next = null;
  let nextName = '';
  
  for (let p of prayers) {
    if (!p.time) continue;
    const [hour, minute] = p.time.split(':').map(Number);
    const prayerTotal = hour * 60 + minute;
    
    if (prayerTotal > currentTotal) {
      next = { hour, minute, total: prayerTotal };
      nextName = p.ar;
      break;
    }
  }
  
  // If no next prayer today, next is Fajr tomorrow
  if (!next) {
    nextName = 'الفجر';
    if (prayerTimes.Fajr) {
      const [hour, minute] = prayerTimes.Fajr.split(':').map(Number);
      next = { hour: hour + 24, minute, total: (hour + 24) * 60 + minute };
    } else {
      next = { hour: 24, minute: 0, total: 24 * 60 };
    }
  }
  
  nextPrayerNameEl.innerText = nextName;
  
  const nowTotal = currentTotal;
  const nextTotal = next.total;
  let diff = nextTotal - nowTotal;
  if (diff < 0) diff += 24 * 60;
  
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const seconds = 59 - now.getSeconds();
  
  remainingTimeEl.innerText = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  
  // Iqama time (15 min after prayer, 5 for Maghrib)
  const iqamaDelay = nextName === 'المغرب' ? 5 : 15;
  let iqamaHour = next.hour % 24;
  let iqamaMinute = next.minute + iqamaDelay;
  if (iqamaMinute >= 60) { iqamaHour++; iqamaMinute -= 60; }
  iqamaTimeEl.innerText = `⏱️ وقت الإقامة: ${iqamaHour.toString().padStart(2,'0')}:${iqamaMinute.toString().padStart(2,'0')}`;
  
  setTimeout(updateNextPrayer, 1000);
}

function loadSavedLocation() {
  const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (saved) {
    try {
      const { lat, lon, timestamp } = JSON.parse(saved);
      if (lat && lon && (Date.now() - timestamp) < 30 * 24 * 60 * 60 * 1000) {
        locationBtn.innerText = '✅ تم تحديد الموقع';
        locationBtn.classList.add('is-located');
        fetchPrayerTimes(lat, lon, false);
        return true;
      }
    } catch(e) {}
  }
  return false;
}

locationBtn.addEventListener('click', () => {
  if (isLocationRequestInProgress || locationBtn.classList.contains('is-located')) {
    return;
  }
  
  if (navigator.geolocation) {
    isLocationRequestInProgress = true;
    locationBtn.innerText = '⏳ جاري التحديد...';
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude, true);
        isLocationRequestInProgress = false;
      },
      (err) => {
        console.error('Geolocation error:', err);
        locationBtn.innerText = '📍 حدد موقعي';
        locationStatus.innerText = 'يرجى السماح بالوصول للموقع من إعدادات المتصفح';
        isLocationRequestInProgress = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    locationStatus.innerText = 'المتصفح لا يدعم تحديد الموقع';
  }
});

// ========== 7. Content Loading (Local Library) ==========
async function loadContentByType(type, mood = null) {
  try {
    let data;
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `athar_${type}_${today}_${mood || 'all'}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      data = JSON.parse(cached);
    } else {
      // Load from local JSON files
      const response = await fetch(`/data/${type === 'ayah' ? 'quran-short-ayahs' : type === 'hadith' ? 'authentic-hadiths' : 'hisn-al-muslim-adhkar'}.json`);
      const library = await response.json();
      
      // Filter by mood if specified
      let items = library[type === 'ayah' ? 'ayahs' : type === 'hadith' ? 'hadiths' : 'adhkar'];
      if (mood && type === 'ayah') {
        items = items.filter(item => item.category === mood);
      }
      
      // Random selection
      const randomIndex = Math.floor(Math.random() * items.length);
      data = items[randomIndex];
      
      // Cache for today
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    
    currentCardData = data;
    
    if (type === 'ayah') {
      cardContentEl.innerText = `"${data.text}"`;
      cardReferenceEl.innerText = `${data.surah} ${data.verse} (ص${data.page})`;
      cardTypeBadge.innerText = 'آية قرآنية';
    } else if (type === 'hadith') {
      cardContentEl.innerText = `"${data.text}"`;
      cardReferenceEl.innerText = `${data.source} - ${data.book}`;
      cardTypeBadge.innerText = 'حديث نبوي';
    } else {
      cardContentEl.innerText = `"${data.text}"`;
      cardReferenceEl.innerText = `${data.category} - ${data.reference}`;
      cardTypeBadge.innerText = 'ذكر';
    }
  } catch(e) {
    console.error('Error loading content:', e);
    // Fallback
    const fallbacks = {
      ayah: { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', ref: 'البقرة ٢٠١' },
      hadith: { text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ', ref: 'صحيح البخاري' },
      dhikr: { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', ref: 'تسبيح' }
    };
    const fb = fallbacks[type];
    cardContentEl.innerText = `"${fb.text}"`;
    cardReferenceEl.innerText = fb.ref;
    cardTypeBadge.innerText = type === 'ayah' ? 'آية قرآنية' : type === 'hadith' ? 'حديث نبوي' : 'ذكر';
  }
}

contentTypeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    contentTypeBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const type = btn.getAttribute('data-type');
    loadContentByType(type);
  });
});

moodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    moodBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const mood = btn.getAttribute('data-mood');
    loadContentByType('ayah', mood);
  });
});

refreshCardBtn.addEventListener('click', () => {
  const activeType = document.querySelector('.content-type-btn.is-active')?.getAttribute('data-type') || 'ayah';
  const activeMood = document.querySelector('.mood-btn.is-active')?.getAttribute('data-mood');
  loadContentByType(activeType, activeMood);
});

// ========== 8. Export Card (1080x1920 Story) ==========
function updateExportCard() {
  exportCardContent.innerText = cardContentEl.innerText;
  exportCardRef.innerText = cardReferenceEl.innerText;
}

async function shareFancyCard() {
  updateExportCard();
  
  const cardElement = document.getElementById('exportCard');
  
  // Ensure fonts are loaded
  await document.fonts.ready;
  
  try {
    const dataUrl = await htmlToImage.toPng(cardElement, {
      pixelRatio: 1,
      quality: 1,
      backgroundColor: null,
      width: 1080,
      height: 1920
    });
    
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'athar-card.png', { type: 'image/png' });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'أثر',
        text: '#أثر_كل_يوم_أثر_نور'
      });
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'athar-card.png';
      link.click();
    }
  } catch(e) {
    console.error('Export error:', e);
    alert('حدث خطأ في تصدير البطاقة');
  }
}

shareBtn.addEventListener('click', shareFancyCard);

// ========== 9. Card Backgrounds ==========
function setCardBackground(bgClass) {
  shareCard.classList.remove('bg-gold', 'bg-blue', 'bg-green');
  shareCard.classList.add(bgClass);
  localStorage.setItem(CARD_BG_KEY, bgClass);
}

bgOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    bgOptions.forEach(o => o.classList.remove('is-active'));
    opt.classList.add('is-active');
    const bg = opt.getAttribute('data-bg');
    if (bg === 'gold') setCardBackground('bg-gold');
    else if (bg === 'blue') setCardBackground('bg-blue');
    else if (bg === 'green') setCardBackground('bg-green');
  });
});

const savedBg = localStorage.getItem(CARD_BG_KEY);
if (savedBg && ['bg-gold','bg-blue','bg-green'].includes(savedBg)) {
  shareCard.classList.add(savedBg);
  bgOptions.forEach(o => {
    if (o.getAttribute('data-bg') === savedBg.replace('bg-', '')) o.classList.add('is-active');
    else o.classList.remove('is-active');
  });
} else {
  shareCard.classList.add('bg-blue');
}

// ========== 10. Dhikr Counter with Haptic ==========
let counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0');
dhikrCounterValue.innerText = counter;

dhikrCounterBtn.addEventListener('click', () => {
  counter++;
  dhikrCounterValue.innerText = counter;
  localStorage.setItem(COUNTER_KEY, counter);
  
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(10);
  
  // Visual pulse
  dhikrCounterValue.classList.add('pulse');
  setTimeout(() => dhikrCounterValue.classList.remove('pulse'), 300);
  
  // Milestone celebration
  if (counter === 33 || counter === 66 || counter === 99 || counter === 100) {
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  }
});

dhikrCounterReset.addEventListener('click', () => {
  counter = 0;
  dhikrCounterValue.innerText = counter;
  localStorage.setItem(COUNTER_KEY, counter);
});

// ========== 11. Morning/Evening Dhikr (Smooth Navigation) ==========
function openDhikrList(category) {
  // Load from local library
  fetch('/data/hisn-al-muslim-adhkar.json')
    .then(r => r.json())
    .then(data => {
      const adhkar = data.adhkar.filter(a => a.category === category);
      let index = 0;
      
      function showNext() {
        if (index >= adhkar.length) {
          alert(`أحسنت! أكملت ${category} 🎉`);
          return;
        }
        
        const current = adhkar[index];
        const progress = `${index + 1}/${adhkar.length}`;
        
        // Create smooth overlay instead of alert
        const overlay = document.createElement('div');
        overlay.className = 'dhikr-overlay';
        overlay.innerHTML = `
          <div class="dhikr-modal">
            <div class="dhikr-progress">${progress}</div>
            <div class="dhikr-text">${current.text}</div>
            <div class="dhikr-ref">${current.reference} — ${current.count} مرة</div>
            <div class="dhikr-actions">
              <button class="dhikr-prev" ${index === 0 ? 'disabled' : ''}>السابق</button>
              <button class="dhikr-next">التالي</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelector('.dhikr-next').addEventListener('click', () => {
          overlay.remove();
          index++;
          showNext();
        });
        
        overlay.querySelector('.dhikr-prev')?.addEventListener('click', () => {
          overlay.remove();
          index--;
          showNext();
        });
      }
      
      showNext();
    });
}

morningDhikrBtn.addEventListener('click', () => openDhikrList('أذكار الصباح'));
eveningDhikrBtn.addEventListener('click', () => openDhikrList('أذكار المساء'));

// ========== 12. Qibla Compass ==========
function calculateQibla(lat, lng) {
  const makkahLat = 21.422487;
  const makkahLng = 39.826206;
  
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;
  const makkahLatRad = makkahLat * Math.PI / 180;
  const makkahLngRad = makkahLng * Math.PI / 180;
  
  const y = Math.sin(makkahLngRad - lngRad);
  const x = Math.cos(latRad) * Math.tan(makkahLatRad) - Math.sin(latRad) * Math.cos(makkahLngRad - lngRad);
  
  let qiblaAngle = Math.atan2(y, x) * 180 / Math.PI;
  if (qiblaAngle < 0) qiblaAngle += 360;
  
  return qiblaAngle;
}

function activateQibla() {
  if (!navigator.geolocation) {
    qiblaStatus.innerText = 'المتصفح لا يدعم تحديد الموقع';
    return;
  }
  
  qiblaStatus.innerText = 'جاري تحديد القبلة...';
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const qiblaAngle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
      qiblaActive = true;
      
      qiblaStatus.innerText = `اتجه نحو ${qiblaAngle.toFixed(1)}°`;
      compassDegree.innerText = `${qiblaAngle.toFixed(0)}°`;
      
      // Device orientation
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        
        // iOS 13+ permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    },
    () => {
      qiblaStatus.innerText = 'يرجى السماح بالوصول للموقع';
    }
  );
}

function handleOrientation(event) {
  if (!qiblaActive) return;
  
  let heading = event.alpha || event.webkitCompassHeading || 0;
  if (event.webkitCompassHeading) heading = event.webkitCompassHeading;
  
  const qiblaAngle = parseFloat(compassDegree.innerText);
  const diff = (qiblaAngle - heading + 360) % 360;
  
  compassArrow.style.transform = `rotate(${diff}deg)`;
  compassRing.style.transform = `rotate(${-heading}deg)`;
  
  // Check alignment
  if (diff < 5 || diff > 355) {
    compassRing.classList.add('is-aligned');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } else {
    compassRing.classList.remove('is-aligned');
  }
}

compassContainer.addEventListener('click', activateQibla);

// ========== 13. Dark Mode ==========
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(DARK_MODE_KEY, isDark ? 'dark' : 'light');
  darkModeToggleBtn.innerText = isDark ? '☀️' : '☾';
}

if (localStorage.getItem(DARK_MODE_KEY) === 'dark') {
  document.body.classList.add('dark');
  darkModeToggleBtn.innerText = '☀️';
}

darkModeToggleBtn.addEventListener('click', toggleDarkMode);

// ========== 14. Service Worker Registration ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Request background sync
        if ('sync' in registration) {
          registration.sync.register('update-athar');
        }
        
        // Request periodic sync
        if ('periodicSync' in registration) {
          registration.periodicSync.register('daily-athar-update', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          }).catch(console.error);
        }
      })
      .catch(console.error);
  });
}

// ========== 15. Initialization ==========
if (!loadSavedLocation()) {
  fetchPrayerTimes(null, null);
}

// Load initial content
loadContentByType('ayah');

// Load daily athar from cache or generate new
function loadDailyAthar() {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `athar_daily_${today}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    currentCardData = JSON.parse(cached);
    cardContentEl.innerText = `"${currentCardData.text}"`;
    cardReferenceEl.innerText = currentCardData.ref;
    cardTypeBadge.innerText = currentCardData.type;
  } else {
    loadContentByType('ayah');
  }
}

loadDailyAthar();
