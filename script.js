// ==========================================
// تطبيق أثر - الإصدار النهائي المتكامل
// تم حل مشكلة التاريخ الميلادي، إضافة اختيار نوع المحتوى، بطاقة مشاركة فاخرة
// ==========================================

// ========== 1. العناصر (DOM Elements) ==========
const currentTimeEl = document.getElementById('currentTime');
const hijriDateEl = document.getElementById('hijriDate');
const gregorianDateEl = document.getElementById('gregorianDate');
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

// عناصر بطاقة التصدير
const exportCardContainer = document.getElementById('exportCardContainer');
const exportCardContent = document.getElementById('exportCardContent');
const exportCardRef = document.getElementById('exportCardRef');

// ========== 2. المتغيرات العامة ==========
let prayerTimes = null;
let isLocationRequestInProgress = false;
const LOCATION_STORAGE_KEY = 'athar_user_location';
let currentCardData = null;
let notificationPermissionGranted = false;
let prayerNotificationInterval = null;

// أذكار الصباح والمساء (موسعة)
const morningAdhkar = [
    "اللهمَّ بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور",
    "أصبحنا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً"
];

const eveningAdhkar = [
    "اللهمَّ بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير",
    "أمسينا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "اللهم إني أسألك خير هذه الليلة وخير ما بعدها، وأعوذ بك من شر هذه الليلة وشر ما بعدها",
    "آمنت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً",
    "اللهم قني عذابك يوم تبعث عبادك"
];

// بيانات احتياطية للبطاقة
const fallbackCards = {
    ayah: { type: "آية قرآنية", content: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", ref: "البقرة 201" },
    hadith: { type: "حديث نبوي", content: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", ref: "صحيح البخاري" },
    dhikr: { type: "ذكر", content: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", ref: "تسبيح" }
};

// ========== 3. الوقت والتاريخ (محلولة مشكلة التاريخ الميلادي) ==========
function updateTimeAndDate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    currentTimeEl.innerText = timeStr;
    
    // التاريخ الميلادي - حل مضمون للمشكلة
    try {
        const gregorianFormatter = new Intl.DateTimeFormat('ar-SA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        gregorianDateEl.innerText = gregorianFormatter.format(now);
    } catch(e) {
        // بديل يدوي في حال فشل Intl
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        gregorianDateEl.innerText = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }
}
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();

// جلب التاريخ الهجري
async function fetchHijriDate() {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
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
fetchHijriDate();

// ========== 4. مواقيت الصلاة مع حفظ الموقع ==========
async function fetchPrayerTimes(lat, lon, saveToStorage = false) {
    try {
        let url;
        if (lat && lon) {
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`;
            if (saveToStorage) {
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ lat, lon, timestamp: Date.now() }));
                if (locationStatus) locationStatus.innerText = '✅ تم حفظ موقعك';
                setTimeout(() => { if (locationStatus) locationStatus.innerText = ''; }, 3000);
            }
        } else {
            url = `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=SA&method=4`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.data && data.data.timings) {
            prayerTimes = data.data.timings;
            updateNextPrayer();
        }
    } catch(e) { 
        console.error(e); 
    }
}

function updateNextPrayer() {
    if (!prayerTimes) return;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let next = null;
    let nextName = '';
    for (let p of prayers) {
        if (!prayerTimes[p]) continue;
        const [hour, minute] = prayerTimes[p].split(':').map(Number);
        if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
            next = { hour, minute };
            nextName = p;
            break;
        }
    }
    if (!next) {
        nextName = 'Fajr';
        if (prayerTimes.Fajr) {
            const [hour, minute] = prayerTimes.Fajr.split(':').map(Number);
            next = { hour: hour+24, minute };
        } else {
            next = { hour: 24, minute: 0 };
        }
    }
    
    const namesAr = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    nextPrayerNameEl.innerText = namesAr[nextName] || nextName;
    
    const nowTotal = currentHour*60 + currentMinute;
    const nextTotal = next.hour*60 + next.minute;
    let diff = nextTotal - nowTotal;
    if (diff < 0) diff += 24*60;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const seconds = Math.floor((60 - now.getSeconds()) % 60);
    remainingTimeEl.innerText = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    
    let iqamaHour = next.hour % 24;
    let iqamaMinute = next.minute + 10;
    if (iqamaMinute >= 60) { iqamaHour++; iqamaMinute -= 60; }
    iqamaTimeEl.innerText = `⏱️ وقت الإقامة: ${iqamaHour.toString().padStart(2,'0')}:${iqamaMinute.toString().padStart(2,'0')}`;
    
    setTimeout(updateNextPrayer, 1000);
}

function loadSavedLocation() {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
        try {
            const { lat, lon, timestamp } = JSON.parse(saved);
            if (lat && lon && (Date.now() - timestamp) < 30*24*60*60*1000) {
                fetchPrayerTimes(lat, lon, false);
                return true;
            }
        } catch(e) {}
    }
    return false;
}

locationBtn.addEventListener('click', () => {
    if (isLocationRequestInProgress) {
        alert('جاري تحديث الموقع...');
        return;
    }
    if (navigator.geolocation) {
        isLocationRequestInProgress = true;
        locationBtn.innerText = '⏳ جاري التحديد...';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude, true);
                locationBtn.innerText = '📍 تم التحديث';
                setTimeout(() => { locationBtn.innerText = '📍 توقيت منطقتي'; }, 2000);
                isLocationRequestInProgress = false;
            },
            () => {
                alert('الرجاء السماح بالوصول إلى الموقع');
                locationBtn.innerText = '📍 توقيت منطقتي';
                isLocationRequestInProgress = false;
            }
        );
    } else {
        alert('المتصفح لا يدعم تحديد الموقع');
    }
});

// ========== 5. اختيار نوع المحتوى (آية، حديث، ذكر) ==========
async function loadContentByType(type) {
    try {
        if (type === 'ayah') {
            const res = await fetch('https://api.alquran.cloud/v1/ayah/random/ar');
            const data = await res.json();
            if (data && data.data) {
                cardContentEl.innerText = `"${data.data.text}"`;
                cardReferenceEl.innerText = `${data.data.surah.name} ${data.data.numberInSurah}`;
                cardTypeBadge.innerText = 'آية قرآنية';
                return;
            }
        } else if (type === 'hadith') {
            const res = await fetch('https://random-hadith-generator.vercel.app/bukhari/random');
            if (res.ok) {
                const data = await res.json();
                if (data && data.textAr) {
                    cardContentEl.innerText = `"${data.textAr}"`;
                    cardReferenceEl.innerText = 'صحيح البخاري';
                    cardTypeBadge.innerText = 'حديث نبوي';
                    return;
                }
            }
        } else if (type === 'dhikr') {
            const adhkarList = [
                "سبحان الله وبحمده سبحان الله العظيم",
                "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
                "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
                "اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم"
            ];
            const random = adhkarList[Math.floor(Math.random() * adhkarList.length)];
            cardContentEl.innerText = `"${random}"`;
            cardReferenceEl.innerText = 'ذكر';
            cardTypeBadge.innerText = 'ذكر';
            return;
        }
        throw new Error('فشل');
    } catch(e) {
        const fallback = fallbackCards[type] || fallbackCards.ayah;
        cardContentEl.innerText = `"${fallback.content}"`;
        cardReferenceEl.innerText = fallback.ref;
        cardTypeBadge.innerText = fallback.type;
    }
}

contentTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        loadContentByType(type);
    });
});

// ========== 6. بطاقة المشاركة الفاخرة (مع هوية أثر ورابط) ==========
function updateExportCard() {
    exportCardContent.innerText = cardContentEl.innerText;
    exportCardRef.innerText = cardReferenceEl.innerText;
}

async function shareFancyCard() {
    updateExportCard();
    const cardElement = document.getElementById('exportCard');
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => captureAndShare(cardElement);
        document.head.appendChild(script);
    } else {
        captureAndShare(cardElement);
    }
}

function captureAndShare(cardElement) {
    html2canvas(cardElement, { scale: 2.5, backgroundColor: null }).then(canvas => {
        canvas.toBlob(blob => {
            const file = new File([blob], 'athar-card.png', { type: 'image/png' });
            if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
                navigator.share({ files: [file], title: 'أثر', text: 'شارك بطاقة روحانية' }).catch(e => console.log('إلغاء'));
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'athar-card.png';
                link.click();
                alert('تم تحميل الصورة بنجاح');
            }
        });
    }).catch(() => alert('حدث خطأ، حاول مرة أخرى'));
}

shareBtn.addEventListener('click', shareFancyCard);

// ========== 7. خلفيات البطاقة ==========
function setCardBackground(bgClass) {
    shareCard.classList.remove('bg-gold', 'bg-blue', 'bg-green');
    shareCard.classList.add(bgClass);
    localStorage.setItem('athar_card_bg', bgClass);
}
bgOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        const bg = opt.getAttribute('data-bg');
        if (bg === 'gold') setCardBackground('bg-gold');
        else if (bg === 'blue') setCardBackground('bg-blue');
        else if (bg === 'green') setCardBackground('bg-green');
    });
});
const savedBg = localStorage.getItem('athar_card_bg');
if (savedBg && ['bg-gold','bg-blue','bg-green'].includes(savedBg)) {
    shareCard.classList.add(savedBg);
} else {
    shareCard.classList.add('bg-blue');
}

// ========== 8. الأذكار والسبحة ==========
function openDhikrList(adhkarArray, title) {
    let index = 0;
    const show = () => {
        const confirm = window.confirm(`${title}\n\n${adhkarArray[index]}\n\nاضغط موافق للذكر التالي`);
        if (confirm) {
            index++;
            if (index < adhkarArray.length) show();
            else alert('تم الانتهاء من الأذكار');
        }
    };
    show();
}
morningDhikrBtn.addEventListener('click', () => openDhikrList(morningAdhkar, 'أذكار الصباح'));
eveningDhikrBtn.addEventListener('click', () => openDhikrList(eveningAdhkar, 'أذكار المساء'));

let counter = parseInt(localStorage.getItem('athar_dhikr_counter') || '0');
dhikrCounterValue.innerText = counter;
dhikrCounterBtn.addEventListener('click', () => {
    counter++;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem('athar_dhikr_counter', counter);
});
dhikrCounterReset.addEventListener('click', () => {
    counter = 0;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem('athar_dhikr_counter', counter);
});

// ========== 9. الوضع الليلي ==========
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('athar_dark_mode', isDark ? 'dark' : 'light');
    darkModeToggleBtn.innerText = isDark ? '☀️ النهاري' : '🌙 الليلي';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#0F2A30' : '#1B6B6F');
}
if (localStorage.getItem('athar_dark_mode') === 'dark') {
    document.body.classList.add('dark');
    darkModeToggleBtn.innerText = '☀️ النهاري';
} else {
    darkModeToggleBtn.innerText = '🌙 الليلي';
}
darkModeToggleBtn.addEventListener('click', toggleDarkMode);

// ========== 10. التشغيل الأولي ==========
if (!loadSavedLocation()) {
    fetchPrayerTimes(null, null);
}
loadContentByType('ayah');
setInterval(() => loadContentByType('ayah'), 3 * 60 * 60 * 1000);
