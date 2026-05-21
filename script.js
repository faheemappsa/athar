// ========================
// تطبيق أثر - الإصدار النهائي المتكامل
// ========================

// العناصر
const currentTimeEl = document.getElementById('currentTime');
const hijriDateEl = document.getElementById('hijriDate');
const gregorianDateEl = document.getElementById('gregorianDate');
const nextPrayerNameEl = document.getElementById('nextPrayerName');
const remainingTimeEl = document.getElementById('remainingTime');
const iqamaTimeEl = document.getElementById('iqamaTime');
const locationBtn = document.getElementById('locationBtn');
const shareBtn = document.getElementById('shareBtn');
const cardContentEl = document.getElementById('cardContent');
const cardReferenceEl = document.getElementById('cardReference');
const cardTypeBadge = document.getElementById('cardTypeBadge');
const morningDhikrBtn = document.getElementById('morningDhikrBtn');
const eveningDhikrBtn = document.getElementById('eveningDhikrBtn');

// حالة المستخدم
let userCity = "Makkah";
let userCountry = "SA";
let prayerTimes = null;
let isLocationRequestInProgress = false;
const LOCATION_STORAGE_KEY = 'athar_user_location';

// أذكار الصباح والمساء (موسعة)
const morningAdhkar = [
    "اللهمَّ بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور",
    "أصبحنا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً",
    "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم"
];

const eveningAdhkar = [
    "اللهمَّ بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير",
    "أمسينا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "اللهم إني أسألك خير هذه الليلة وخير ما بعدها، وأعوذ بك من شر هذه الليلة وشر ما بعدها",
    "آمنت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً",
    "اللهم قني عذابك يوم تبعث عبادك",
    "أمسينا وأمسى الملك لله والحمد لله"
];

// ========== 1. الوقت والتاريخ ==========
function updateTimeAndDate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    currentTimeEl.innerText = timeStr;
    
    // التاريخ الميلادي - طريقة مضمونة في كل المتصفحات
    const gregorianFormatter = new Intl.DateTimeFormat('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    gregorianDateEl.innerText = gregorianFormatter.format(now);
}
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();

// التاريخ الهجري من API
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
        console.log(e); 
        hijriDateEl.innerText = "-- -- ----"; 
    }
}
fetchHijriDate();

// ========== 2. مواقيت الصلاة ==========
async function fetchPrayerTimes(lat, lon, saveToStorage = false) {
    try {
        let url;
        if (lat && lon) {
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`;
            if (saveToStorage) {
                const locationData = { lat, lon, timestamp: Date.now() };
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
                locationBtn.innerText = '✅ تم التحديث حسب موقعك';
                setTimeout(() => {
                    if (locationBtn.innerText === '✅ تم التحديث حسب موقعك') {
                        locationBtn.innerText = '📍 توقيت منطقتي';
                    }
                }, 3000);
            }
        } else {
            url = `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=SA&method=4`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.data && data.data.timings) {
            prayerTimes = data.data.timings;
            updateNextPrayer();
        } else {
            console.warn("لم يتم استلام مواقيت الصلاة");
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
    
    // وقت الإقامة (إضافة 10 دقائق افتراضياً)
    let iqamaHour = next.hour % 24;
    let iqamaMinute = next.minute + 10;
    if (iqamaMinute >= 60) {
        iqamaHour += 1;
        iqamaMinute -= 60;
    }
    iqamaTimeEl.innerText = `⏱️ وقت الإقامة: ${iqamaHour.toString().padStart(2,'0')}:${iqamaMinute.toString().padStart(2,'0')}`;
    
    setTimeout(updateNextPrayer, 1000);
}

// استعادة الموقع المحفوظ
function loadSavedLocation() {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
        try {
            const { lat, lon, timestamp } = JSON.parse(saved);
            const isRecent = (Date.now() - timestamp) < 30 * 24 * 60 * 60 * 1000;
            if (lat && lon && isRecent) {
                fetchPrayerTimes(lat, lon, false);
                locationBtn.innerText = '📍 توقيت منطقتي (محفوظ)';
                return true;
            } else {
                localStorage.removeItem(LOCATION_STORAGE_KEY);
            }
        } catch(e) { console.error(e); }
    }
    return false;
}

// طلب الموقع
locationBtn.addEventListener('click', () => {
    if (isLocationRequestInProgress) {
        alert('جاري تحديث الموقع، يرجى الانتظار...');
        return;
    }
    
    if (navigator.geolocation) {
        isLocationRequestInProgress = true;
        locationBtn.innerText = '⏳ جاري تحديد الموقع...';
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude, true);
                isLocationRequestInProgress = false;
            },
            (error) => {
                isLocationRequestInProgress = false;
                let errorMessage = 'لم نتمكن من الوصول إلى موقعك. سيتم استخدام توقيت مكة.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'الرجاء السماح بالوصول إلى الموقع للحصول على توقيت دقيق.';
                }
                alert(errorMessage);
                locationBtn.innerText = '📍 توقيت منطقتي';
            }
        );
    } else {
        alert('المتصفح لا يدعم تحديد الموقع');
    }
});

// ========== 3. البطاقة اليومية (آية/حديث/ذكر) ==========
async function loadCard() {
    try {
        const types = ['ayah', 'hadith', 'dhikr'];
        const type = types[Math.floor(Math.random() * types.length)];
        if (type === 'ayah') {
            const res = await fetch('https://api.alquran.cloud/v1/ayah/random/ar');
            const data = await res.json();
            if (data && data.data) {
                cardContentEl.innerText = `"${data.data.text}"`;
                cardReferenceEl.innerText = `${data.data.surah.name} ${data.data.numberInSurah}`;
                cardTypeBadge.innerText = 'آية قرآنية';
            } else {
                throw new Error('API response invalid');
            }
        } else if (type === 'hadith') {
            // محاولة جلب حديث عشوائي - استخدام API بديل موثوق
            const res = await fetch('https://hadith-api-dusky.vercel.app/api/hadiths/random');
            if (!res.ok) throw new Error('Hadith API failed');
            const data = await res.json();
            if (data && data.text) {
                cardContentEl.innerText = `"${data.text}"`;
                cardReferenceEl.innerText = data.reference || 'صحيح البخاري';
                cardTypeBadge.innerText = 'حديث نبوي';
            } else {
                throw new Error('No hadith data');
            }
        } else {
            const adhkarList = [
                "سبحان الله وبحمده سبحان الله العظيم",
                "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
                "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
                "اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد",
                "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه"
            ];
            const random = adhkarList[Math.floor(Math.random() * adhkarList.length)];
            cardContentEl.innerText = `"${random}"`;
            cardReferenceEl.innerText = 'ذكر';
            cardTypeBadge.innerText = 'ذكر';
        }
    } catch(e) {
        console.log(e);
        // بيانات احتياطية ثابتة
        cardContentEl.innerText = '"ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار"';
        cardReferenceEl.innerText = 'البقرة 201';
        cardTypeBadge.innerText = 'آية قرآنية';
    }
}

// ========== 4. مشاركة البطاقة كصورة ==========
function generateAndShare(card, html2canvasLib) {
    html2canvasLib(card, { scale: 2, backgroundColor: '#FFFFFF' }).then(canvas => {
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'athar-card.png', { type: 'image/png' });
            if (navigator.share && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({ files: [file], title: 'أثر', text: 'شارك بطاقة روحانية' });
                } catch(shareErr) {
                    console.log('Share cancelled', shareErr);
                }
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'athar-card.png';
                link.click();
                alert('تم تحميل الصورة بنجاح');
            }
        });
    }).catch(err => {
        console.error(err);
        alert('يمكنك مشاركة البطاقة عبر التقاط صورة للشاشة حالياً');
    });
}

shareBtn.addEventListener('click', () => {
    const card = document.getElementById('shareCard');
    if (typeof html2canvas !== 'undefined') {
        generateAndShare(card, html2canvas);
    } else {
        // تحميل المكتبة ديناميكياً إذا لم تكن موجودة
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            generateAndShare(card, html2canvas);
        };
        script.onerror = () => {
            alert('تعذر تحميل مكتبة مشاركة الصور، يرجى تحديث الصفحة');
        };
        document.head.appendChild(script);
    }
});

// ========== 5. أذكار الصباح والمساء ==========
function openDhikrList(adhkarArray, title) {
    let index = 0;
    const displayDhikr = () => {
        const userConfirm = confirm(`${title}\n\n${adhkarArray[index]}\n\nاضغط "موافق" للذكر التالي، أو "إلغاء" للإغلاق`);
        if (userConfirm) {
            index++;
            if (index < adhkarArray.length) displayDhikr();
            else alert('تم الانتهاء من الأذكار. جزاك الله خيراً');
        }
    };
    displayDhikr();
}
morningDhikrBtn.addEventListener('click', () => openDhikrList(morningAdhkar, 'أذكار الصباح'));
eveningDhikrBtn.addEventListener('click', () => openDhikrList(eveningAdhkar, 'أذكار المساء'));

// ========== 6. التشغيل الأولي واستعادة الحالة ==========
// محاولة استعادة موقع المستخدم المحفوظ، وإلا استخدم مكة
if (!loadSavedLocation()) {
    fetchPrayerTimes(null, null);
}

// تحميل بطاقة عشوائية أول مرة
loadCard();
// تحديث البطاقة كل 3 ساعات
setInterval(loadCard, 3 * 60 * 60 * 1000);
