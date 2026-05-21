// ========================
// تطبيق أثر - الإصدار النهائي
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

// أذكار الصباح والمساء
const morningAdhkar = [
    "اللهمَّ بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور",
    "أصبحنا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته",
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة"
];
const eveningAdhkar = [
    "اللهمَّ بك أمسينا، وبك أصبحنا،وبك نحيا، وبك نموت، وإليك المصير",
    "أمسينا على فطرة الإسلام، وكلمة الإخلاص، ودين نبينا محمد ﷺ، وملة أبينا إبراهيم حنيفًا مسلمًا وما كان من المشركين",
    "اللهمَّ ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر",
    "اللهم إني أسألك خير هذه الليلة وخير ما بعدها، وأعوذ بك من شر هذه الليلة وشر ما بعدها",
    "آمنت بالله رباً، وبالإسلام ديناً، وبمحمد نبياً"
];

// تحديث الوقت والتاريخ
function updateTimeAndDate() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    currentTimeEl.innerText = timeStr;
    
    const gregorian = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    gregorianDateEl.innerText = gregorian;
}
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();

// جلب التاريخ الهجري
async function fetchHijriDate() {
    try {
        const res = await fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toISOString().split('T')[0]);
        const data = await res.json();
        if (data.data) {
            hijriDateEl.innerText = `${data.data.hijri.day} ${data.data.hijri.month.ar} ${data.data.hijri.year}`;
        }
    } catch(e) { 
        console.log(e); 
        hijriDateEl.innerText = "-- -- ----"; 
    }
}
fetchHijriDate();

// جلب مواقيت الصلاة
async function fetchPrayerTimes(lat, lon) {
    try {
        let url;
        if (lat && lon) {
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`;
        } else {
            url = `https://api.aladhan.com/v1/timingsByCity?city=Makkah&country=SA&method=4`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.data) {
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
        const [hour, minute] = prayerTimes[p].split(':').map(Number);
        if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
            next = { hour, minute };
            nextName = p;
            break;
        }
    }
    if (!next) {
        nextName = 'Fajr';
        const [hour, minute] = prayerTimes['Fajr'].split(':').map(Number);
        next = { hour: hour+24, minute };
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
    
    // وقت الإقامة (نضيف 10 دقائق افتراضياً)
    let iqamaHour = next.hour % 24;
    let iqamaMinute = next.minute + 10;
    if (iqamaMinute >= 60) {
        iqamaHour += 1;
        iqamaMinute -= 60;
    }
    iqamaTimeEl.innerText = `⏱️ وقت الإقامة: ${iqamaHour.toString().padStart(2,'0')}:${iqamaMinute.toString().padStart(2,'0')}`;
    
    setTimeout(updateNextPrayer, 1000);
}

// طلب الموقع
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
            locationBtn.innerText = '✅ تم تحديث التوقيت حسب موقعك';
            setTimeout(() => locationBtn.innerText = '📍 توقيت منطقتي (السماح بالموقع)', 3000);
        }, () => {
            alert('لم نتمكن من الوصول إلى موقعك. سيتم استخدام توقيت مكة.');
        });
    } else {
        alert('المتصفح لا يدعم تحديد الموقع');
    }
});

// تحميل البطاقة (آية/حديث/ذكر) من API
async function loadCard() {
    try {
        const types = ['ayah', 'hadith', 'dhikr'];
        const type = types[Math.floor(Math.random() * types.length)];
        if (type === 'ayah') {
            const res = await fetch('https://api.alquran.cloud/v1/ayah/random/ar');
            const data = await res.json();
            cardContentEl.innerText = `"${data.data.text}"`;
            cardReferenceEl.innerText = `${data.data.surah.name} ${data.data.numberInSurah}`;
            cardTypeBadge.innerText = 'آية قرآنية';
        } else if (type === 'hadith') {
            // استخدام Hadith API (random hadith from Bukhari)
            const res = await fetch('https://random-hadith-generator.vercel.app/bukhari/random');
            const data = await res.json();
            cardContentEl.innerText = `"${data.textAr || data.text}"`;
            cardReferenceEl.innerText = `صحيح البخاري`;
            cardTypeBadge.innerText = 'حديث نبوي';
        } else {
            const adhkarList = [
                "سبحان الله وبحمده سبحان الله العظيم",
                "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
                "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
                "اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد"
            ];
            const random = adhkarList[Math.floor(Math.random() * adhkarList.length)];
            cardContentEl.innerText = `"${random}"`;
            cardReferenceEl.innerText = 'ذكر';
            cardTypeBadge.innerText = 'ذكر';
        }
    } catch(e) {
        console.log(e);
        // البيانات الاحتياطية
        cardContentEl.innerText = '"ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار"';
        cardReferenceEl.innerText = 'البقرة 201';
        cardTypeBadge.innerText = 'آية قرآنية';
    }
}

// مشاركة البطاقة كصورة
shareBtn.addEventListener('click', async () => {
    const card = document.getElementById('shareCard');
    // تحميل html2canvas من CDN ديناميكياً
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => generateAndShare(card);
        document.head.appendChild(script);
    } else {
        generateAndShare(card);
    }
});

async function generateAndShare(card) {
    try {
        const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#FFFFFF' });
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'athar-card.png', { type: 'image/png' });
            if (navigator.share && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                await navigator.share({ files: [file], title: 'أثر', text: 'شارك بطاقة روحانية' });
            } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'athar-card.png';
                link.click();
                alert('تم تحميل الصورة بنجاح');
            }
        });
    } catch(e) {
        alert('يمكنك مشاركة البطاقة عبر التقاط صورة للشاشة حالياً');
    }
}

// أذكار الصباح والمساء
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

// تحميل البطاقة أول مرة
loadCard();
// تحديث البطاقة كل 3 ساعات
setInterval(loadCard, 3 * 60 * 60 * 1000);

// جلب مواقيت مكة افتراضياً
fetchPrayerTimes(null, null);
