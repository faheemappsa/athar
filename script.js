// ==========================================
// تطبيق أثر - الإصدار النهائي المتكامل
// جميع الوظائف: الوقت، التاريخ، الصلاة، البطاقة، الأذكار، السبحة، الوضع الليلي، الإشعارات
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

// ========== 2. المتغيرات العامة ==========
let prayerTimes = null;
let isLocationRequestInProgress = false;
const LOCATION_STORAGE_KEY = 'athar_user_location';
let currentCardData = null;
let notificationPermissionGranted = false;
let prayerNotificationInterval = null;

// أذكار الصباح والمساء (موسعة ومتنوعة)
const morningAdhkar = [
    "اللهمَّ بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور",
    "أصبحنا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً",
    "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
    "اللهم صلِّ وسلم على نبينا محمد"
];
const eveningAdhkar = [
    "اللهمَّ بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير",
    "أمسينا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "اللهم إني أسألك خير هذه الليلة وخير ما بعدها، وأعوذ بك من شر هذه الليلة وشر ما بعدها",
    "آمنت بالله رباً، وبالإسلام ديناً، وبمحمد ﷺ نبياً",
    "اللهم قني عذابك يوم تبعث عبادك",
    "أمسينا وأمسى الملك لله والحمد لله",
    "اللهم صلِّ وسلم على نبينا محمد"
];

// بيانات احتياطية للبطاقة (في حال فشل الـ API)
const fallbackCards = [
    { type: "آية قرآنية", content: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", ref: "البقرة 201" },
    { type: "آية قرآنية", content: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", ref: "البقرة 153" },
    { type: "حديث نبوي", content: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", ref: "صحيح البخاري" },
    { type: "ذكر", content: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", ref: "تسبيح" },
    { type: "ذكر", content: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", ref: "ذكر" }
];

// ========== 3. الوقت والتاريخ (محسّن) ==========
function updateTimeAndDate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    currentTimeEl.innerText = timeStr;
    
    // التاريخ الميلادي باستخدام Intl.DateTimeFormat (مضمون)
    const gregorianFormatter = new Intl.DateTimeFormat('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    gregorianDateEl.innerText = gregorianFormatter.format(now);
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
        console.log(e); 
        hijriDateEl.innerText = "-- -- ----"; 
    }
}
fetchHijriDate();

// ========== 4. مواقيت الصلاة مع حفظ الموقع (لا يطلب كل مرة) ==========
async function fetchPrayerTimes(lat, lon, saveToStorage = false) {
    try {
        let url;
        if (lat && lon) {
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`;
            if (saveToStorage) {
                const locationData = { lat, lon, timestamp: Date.now() };
                localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
                if (locationStatus) locationStatus.innerText = '✅ تم حفظ موقعك، لن يُطلب مجدداً';
                setTimeout(() => {
                    if (locationStatus) locationStatus.innerText = '';
                }, 4000);
            }
        } else {
            url = `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=SA&method=4`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.data && data.data.timings) {
            prayerTimes = data.data.timings;
            updateNextPrayer();
            // جدولة الإشعارات بعد تحديث الأوقات
            schedulePrayerNotifications();
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
                if (locationStatus) locationStatus.innerText = '📍 تم استعادة موقعك المحفوظ';
                setTimeout(() => {
                    if (locationStatus) locationStatus.innerText = '';
                }, 3000);
                return true;
            } else {
                localStorage.removeItem(LOCATION_STORAGE_KEY);
            }
        } catch(e) { console.error(e); }
    }
    return false;
}

// طلب الموقع (مرة واحدة فقط)
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
                locationBtn.innerText = '📍 توقيت منطقتي (محفوظ)';
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

// ========== 5. إشعارات الأذان (Push Notifications) ==========
function requestNotificationPermission() {
    if ('Notification' in window && navigator.serviceWorker) {
        Notification.requestPermission().then(permission => {
            notificationPermissionGranted = permission === 'granted';
            if (notificationPermissionGranted) {
                console.log('إشعارات مفعلة');
            }
        });
    }
}

function schedulePrayerNotifications() {
    if (!notificationPermissionGranted || !prayerTimes) return;
    // إلغاء الإشعارات السابقة
    if (prayerNotificationInterval) clearInterval(prayerNotificationInterval);
    
    // التحقق كل دقيقة إذا حان وقت صلاة
    prayerNotificationInterval = setInterval(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        for (let [prayer, time] of Object.entries(prayerTimes)) {
            if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
                const [hour, minute] = time.split(':').map(Number);
                if (hour === currentHour && minute === currentMinute) {
                    const namesAr = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
                    new Notification(`🕌 حان وقت صلاة ${namesAr[prayer]}`, {
                        body: 'اللهم تقبل منا الصلاة والطاعات',
                        icon: 'https://raw.githubusercontent.com/faheemappsa/athar/main/icon-192.png',
                        vibrate: [200, 100, 200]
                    });
                }
            }
        }
    }, 60000);
}

// تفعيل الإشعارات عند تحميل الصفحة
if ('Notification' in window && navigator.serviceWorker) {
    requestNotificationPermission();
    navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker جاهز للإشعارات');
    });
}

// ========== 6. البطاقة الدينية (آية/حديث/ذكر) ==========
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
                return;
            }
        } else if (type === 'hadith') {
            // محاولة جلب حديث عشوائي
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
        } else {
            // أذكار متنوعة
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
            return;
        }
        throw new Error('فشل جلب المحتوى');
    } catch(e) {
        console.log('استخدام بيانات احتياطية', e);
        const fallback = fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
        cardContentEl.innerText = `"${fallback.content}"`;
        cardReferenceEl.innerText = fallback.ref;
        cardTypeBadge.innerText = fallback.type;
    }
}

// ========== 7. مشاركة البطاقة كصورة ==========
function generateAndShare(cardElement, html2canvasLib) {
    html2canvasLib(cardElement, { scale: 2, backgroundColor: '#FFFFFF' }).then(canvas => {
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'athar-card.png', { type: 'image/png' });
            if (navigator.share && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({ files: [file], title: 'أثر', text: 'شارك بطاقة روحانية' });
                } catch(shareErr) {
                    console.log('تم إلغاء المشاركة');
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
    if (typeof html2canvas !== 'undefined') {
        generateAndShare(shareCard, html2canvas);
    } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            generateAndShare(shareCard, html2canvas);
        };
        script.onerror = () => {
            alert('تعذر تحميل مكتبة مشاركة الصور، يرجى تحديث الصفحة');
        };
        document.head.appendChild(script);
    }
});

// ========== 8. خلفيات البطاقة ==========
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
if (savedBg && ['bg-gold', 'bg-blue', 'bg-green'].includes(savedBg)) {
    shareCard.classList.add(savedBg);
} else {
    shareCard.classList.add('bg-blue'); // افتراضي
}

// ========== 9. أذكار الصباح والمساء (تفاعلية) ==========
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

// ========== 10. السبحة الرقمية ==========
let counter = parseInt(localStorage.getItem('athar_dhikr_counter') || '0');
dhikrCounterValue.innerText = counter;
dhikrCounterBtn.addEventListener('click', () => {
    counter++;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem('athar_dhikr_counter', counter);
    // تأثير اهتزاز بسيط
    dhikrCounterBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { dhikrCounterBtn.style.transform = ''; }, 100);
});
dhikrCounterReset.addEventListener('click', () => {
    counter = 0;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem('athar_dhikr_counter', counter);
});

// ========== 11. الوضع الليلي (Dark Mode) ==========
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('athar_dark_mode', isDark ? 'dark' : 'light');
    darkModeToggleBtn.innerText = isDark ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي';
    // تحديث لون شريط الحالة
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#0F2A30' : '#1B6B6F');
    }
}
const savedDark = localStorage.getItem('athar_dark_mode');
if (savedDark === 'dark') {
    document.body.classList.add('dark');
    darkModeToggleBtn.innerText = '☀️ الوضع النهاري';
} else {
    darkModeToggleBtn.innerText = '🌙 الوضع الليلي';
}
darkModeToggleBtn.addEventListener('click', toggleDarkMode);

// ========== 12. التشغيل الأولي ==========
// استعادة موقع المستخدم المحفوظ، وإلا استخدم مكة
if (!loadSavedLocation()) {
    fetchPrayerTimes(null, null);
}
// تحميل بطاقة عشوائية أول مرة
loadCard();
// تحديث البطاقة كل 3 ساعات
setInterval(loadCard, 3 * 60 * 60 * 1000);
