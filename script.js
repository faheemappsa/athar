// ==========================================
// أثر v5 — Aladhan API | دقيق | موثوق | PWA
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
let currentCardData = null;
let qiblaActive = false;
let updateInterval = null;

// ========== 3. Aladhan API Integration ==========
const ALADHAN_API = 'https://api.aladhan.com/v1';

// Fetch prayer times + hijri date + gregorian date from Aladhan
async function fetchAladhanData(lat, lon, date = new Date()) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    
    const url = `${ALADHAN_API}/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=4&school=0`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Aladhan API error');
    
    const data = await response.json();
    return data.data;
}

// Fetch qibla direction
async function fetchQiblaDirection(lat, lon) {
    const url = `${ALADHAN_API}/qibla/${lat}/${lon}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Qibla API error');
    const data = await response.json();
    return data.data.direction;
}

// ========== 4. Time & Date ==========
function updateTimeAndDate() {
    const now = new Date();
    
    // Current time
    const timeStr = now.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    currentTimeEl.innerText = timeStr;
    
    // Update theme based on time
    updateThemeColor(now);
}

function updateGregorianDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    gregorianDateEl.innerText = date.toLocaleDateString('ar-SA', options);
}

function updateHijriDate(hijriData) {
    if (hijriData && hijriData.hijri) {
        const h = hijriData.hijri;
        hijriDateEl.innerText = `${h.day} ${h.month.ar} ${h.year} هـ`;
    } else {
        hijriDateEl.innerText = '-- -- ----';
    }
}

function updateDayAndOccasion(date, hijriData) {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[date.getDay()];
    
    // Check for special occasions (Gregorian)
    const occasion = getOccasion(date);
    
    // Check for Ramadan and special Hijri occasions
    let hijriOccasion = null;
    if (hijriData && hijriData.hijri) {
        hijriOccasion = getHijriOccasion(hijriData.hijri);
    }
    
    const finalOccasion = hijriOccasion || occasion;
    
    if (finalOccasion) {
        dayAndOccasionEl.innerText = `${dayName} — ${finalOccasion.emoji} ${finalOccasion.name}`;
        occasionLabelEl.innerText = finalOccasion.type;
    } else {
        dayAndOccasionEl.innerText = dayName;
        occasionLabelEl.innerText = 'اليوم';
    }
}

function getOccasion(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const occasions = {
        '1-1': { name: 'رأس السنة الميلادية', emoji: '🎆', type: 'مناسبة' },
        '9-11': { name: 'ذكرى 11 سبتمبر', emoji: '🕯️', type: 'ذكرى' },
        '10-24': { name: 'اليوم الوطني السعودي', emoji: '🇸🇦', type: 'عيد' },
        '12-25': { name: 'الميلاد المجيد', emoji: '🎄', type: 'مناسبة' },
    };
    
    const key = `${month}-${day}`;
    return occasions[key] || null;
}

function getHijriOccasion(hijri) {
    const month = parseInt(hijri.month.number);
    const day = parseInt(hijri.day);
    
    const occasions = {
        '1-1': { name: 'رأس السنة الهجرية', emoji: '📅', type: 'عيد' },
        '1-10': { name: 'عاشوراء', emoji: '📿', type: 'مناسبة' },
        '3-12': { name: 'المولد النبوي الشريف', emoji: '🌹', type: 'عيد' },
        '7-27': { name: 'ليلة الإسراء والمعراج', emoji: '✨', type: 'مناسبة' },
        '8-15': { name: 'يوم البراءة (نصف شعبان)', emoji: '🌙', type: 'مناسبة' },
        '9-1': { name: 'رمضان المبارك', emoji: '🌙', type: 'شهر' },
        '9-21': { name: 'ليلة القدر', emoji: '✨', type: 'مناسبة' },
        '9-23': { name: 'ليلة القدر', emoji: '✨', type: 'مناسبة' },
        '9-25': { name: 'ليلة القدر', emoji: '✨', type: 'مناسبة' },
        '9-27': { name: 'ليلة القدر', emoji: '✨', type: 'مناسبة' },
        '10-1': { name: 'عيد الفطر المبارك', emoji: '🎉', type: 'عيد' },
        '10-2': { name: 'عيد الفطر', emoji: '🎉', type: 'عيد' },
        '10-3': { name: 'عيد الفطر', emoji: '🎉', type: 'عيد' },
        '12-8': { name: 'يوم التروية', emoji: '💧', type: 'مناسبة' },
        '12-9': { name: 'يوم عرفة', emoji: '🕋', type: 'مناسبة' },
        '12-10': { name: 'عيد الأضحى المبارك', emoji: '🐑', type: 'عيد' },
        '12-11': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
        '12-12': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
        '12-13': { name: 'أيام التشريق', emoji: '🌅', type: 'مناسبة' },
    };
    
    const key = `${month}-${day}`;
    return occasions[key] || null;
}

function updateHeroByTime(date, prayerTimesData) {
    const hour = date.getHours();
    let prayerClass = '';
    let hookText = '';
    let hookSubtext = '';
    
    // Determine current prayer period
    let currentPrayer = null;
    if (prayerTimesData && prayerTimesData.timings) {
        const t = prayerTimesData.timings;
        const now = date.getHours() * 60 + date.getMinutes();
        
        const prayers = [
            { name: 'الفجر', time: timeToMinutes(t.Fajr), class: 'fajr' },
            { name: 'الشروق', time: timeToMinutes(t.Sunrise), class: 'sunrise' },
            { name: 'الظهر', time: timeToMinutes(t.Dhuhr), class: 'zuhr' },
            { name: 'العصر', time: timeToMinutes(t.Asr), class: 'asr' },
            { name: 'المغرب', time: timeToMinutes(t.Maghrib), class: 'maghrib' },
            { name: 'العشاء', time: timeToMinutes(t.Isha), class: 'isha' }
        ];
        
        for (let i = prayers.length - 1; i >= 0; i--) {
            if (now >= prayers[i].time) {
                currentPrayer = prayers[i];
                break;
            }
        }
    }
    
    // Set hook based on time and prayer
    if (hour >= 4 && hour < 6) {
        prayerClass = 'fajr';
        hookText = 'أصبحنا وأصبح الملك لله...';
        hookSubtext = 'اللهم بك أصبحنا وبك أمسينا';
    } else if (hour >= 6 && hour < 9) {
        prayerClass = 'morning';
        hookText = 'اللهم بارك لنا في هذا اليوم';
        hookSubtext = 'واجعله يوماً مليئاً بالخير';
    } else if (hour >= 9 && hour < 12) {
        prayerClass = 'forenoon';
        hookText = 'اللهم لا تذهب نعمتك عنا';
        hookSubtext = 'واجعلنا من الشاكرين';
    } else if (hour >= 12 && hour < 15) {
        prayerClass = 'zuhr';
        hookText = 'اللهم اجعلنا من المتوكلين عليك';
        hookSubtext = 'وافتح لنا يا كريم';
    } else if (hour >= 15 && hour < 17) {
        prayerClass = 'asr';
        hookText = 'اللهم لا تُخْلِفْ لنا وعدك';
        hookSubtext = 'واجعل العصر خيراً من الضحى';
    } else if (hour >= 17 && hour < 19) {
        prayerClass = 'maghrib';
        hookText = 'اللهم لك صمت وعلى رزقك أفطرت';
        hookSubtext = 'تقبل الله منا ومنكم';
    } else if (hour >= 19 && hour < 21) {
        prayerClass = 'isha';
        hookText = 'اللهم أنت ربي لا إله إلا أنت';
        hookSubtext = 'اللهم قني عذابك يوم تبعث عبادك';
    } else {
        prayerClass = 'night';
        hookText = 'اللهم باسمك أموت وأحيا';
        hookSubtext = 'سبحان الله والحمد لله ولا إله إلا الله';
    }
    
    visualHero.className = `visual-hero ${prayerClass}`;
    
    // Update hook with animation
    const hookLine = dailyHook.querySelector('.hook-line');
    if (hookLine.innerText !== hookText) {
        dailyHook.style.opacity = '0';
        setTimeout(() => {
            hookLine.innerText = hookText;
            dailyHook.style.opacity = '1';
        }, 300);
    }
}

function updateThemeColor(date) {
    const hour = date.getHours();
    let color = '#1B6B6F';
    
    if (hour >= 4 && hour < 6) color = '#2D4A5E';      // Fajr
    else if (hour >= 6 && hour < 12) color = '#1B6B6F'; // Morning
    else if (hour >= 12 && hour < 15) color = '#C17817'; // Dhuhr
    else if (hour >= 15 && hour < 17) color = '#8B4513'; // Asr
    else if (hour >= 17 && hour < 19) color = '#8B2500'; // Maghrib
    else if (hour >= 19 && hour < 21) color = '#1B3A3B'; // Isha
    else color = '#0B171B'; // Night
    
    themeColorMeta.setAttribute('content', color);
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// ========== 5. Prayer Times with Aladhan API ==========
async function fetchPrayerTimes(lat, lon, saveToStorage = false) {
    try {
        const aladhanData = await fetchAladhanData(lat, lon);
        
        prayerTimes = {
            timings: aladhanData.timings,
            date: aladhanData.date,
            meta: aladhanData.meta
        };
        
        // Save location
        if (saveToStorage) {
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ 
                lat, 
                lon, 
                timestamp: Date.now(),
                city: aladhanData.meta.timezone || 'تم التحديد'
            }));
            locationBtn.innerText = '✅ تم تحديد الموقع';
            locationBtn.classList.add('is-located');
            locationStatus.innerText = `المنطقة الزمنية: ${aladhanData.meta.timezone}`;
        }
        
        // Update UI
        updatePrayerDisplay();
        updateHijriDate(aladhanData);
        updateGregorianDate(new Date());
        updateDayAndOccasion(new Date(), aladhanData);
        updateHeroByTime(new Date(), aladhanData);
        
        // Start countdown
        startPrayerCountdown();
        
    } catch(e) { 
        console.error('Prayer times error:', e);
        locationStatus.innerText = 'حدث خطأ في جلب المواقيت. حاول مرة أخرى.';
        // Fallback to Makkah
        if (!prayerTimes) {
            fetchPrayerTimes(21.4225, 39.8262, false);
        }
    }
}

function updatePrayerDisplay() {
    if (!prayerTimes || !prayerTimes.timings) return;
    
    const t = prayerTimes.timings;
    
    // Create or update prayer times list if not exists
    let prayerListEl = document.getElementById('prayerTimesList');
    if (!prayerListEl) {
        prayerListEl = document.createElement('div');
        prayerListEl.id = 'prayerTimesList';
        prayerListEl.className = 'prayer-times-list';
        document.getElementById('prayerCard').insertBefore(prayerListEl, document.querySelector('.next-prayer'));
    }
    
    const prayers = [
        { key: 'Fajr', ar: 'الفجر', icon: '🌅' },
        { key: 'Sunrise', ar: 'الشروق', icon: '🌄' },
        { key: 'Dhuhr', ar: 'الظهر', icon: '☀️' },
        { key: 'Asr', ar: 'العصر', icon: '🌤️' },
        { key: 'Maghrib', ar: 'المغرب', icon: '🌇' },
        { key: 'Isha', ar: 'العشاء', icon: '🌙' }
    ];
    
    const now = new Date();
    const currentTotal = now.getHours() * 60 + now.getMinutes();
    
    let html = '';
    prayers.forEach(prayer => {
        const time = t[prayer.key];
        const prayerTotal = timeToMinutes(time);
        const isPast = currentTotal > prayerTotal;
        const isCurrent = Math.abs(currentTotal - prayerTotal) < 30; // Within 30 min
        
        const statusClass = isPast ? 'past' : (isCurrent ? 'current' : 'upcoming');
        const currentIndicator = isCurrent ? '<span class="current-indicator">●</span>' : '';
        
        html += `
            <div class="prayer-time-item ${statusClass}">
                <span class="prayer-icon">${prayer.icon}</span>
                <span class="prayer-name">${prayer.ar}</span>
                <span class="prayer-time">${time}</span>
                ${currentIndicator}
            </div>
        `;
    });
    
    prayerListEl.innerHTML = html;
}

function startPrayerCountdown() {
    if (updateInterval) clearInterval(updateInterval);
    
    function update() {
        if (!prayerTimes || !prayerTimes.timings) return;
        
        const now = new Date();
        const currentTotal = now.getHours() * 60 + now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        const prayers = [
            { name: 'Fajr', ar: 'الفجر', time: prayerTimes.timings.Fajr },
            { name: 'Sunrise', ar: 'الشروق', time: prayerTimes.timings.Sunrise },
            { name: 'Dhuhr', ar: 'الظهر', time: prayerTimes.timings.Dhuhr },
            { name: 'Asr', ar: 'العصر', time: prayerTimes.timings.Asr },
            { name: 'Maghrib', ar: 'المغرب', time: prayerTimes.timings.Maghrib },
            { name: 'Isha', ar: 'العشاء', time: prayerTimes.timings.Isha }
        ];
        
        // Find next prayer
        let nextPrayer = null;
        let currentPrayer = null;
        
        for (let i = 0; i < prayers.length; i++) {
            const prayerTotal = timeToMinutes(prayers[i].time);
            
            if (prayerTotal > currentTotal) {
                nextPrayer = prayers[i];
                currentPrayer = prayers[i - 1] || prayers[prayers.length - 1];
                break;
            }
        }
        
        // If no next prayer today, next is Fajr tomorrow
        if (!nextPrayer) {
            nextPrayer = prayers[0];
            currentPrayer = prayers[prayers.length - 1];
        }
        
        // Calculate remaining time
        let nextTotal = timeToMinutes(nextPrayer.time);
        if (!nextPrayer || nextTotal <= currentTotal) {
            nextTotal += 24 * 60; // Next day
        }
        
        const diffMinutes = nextTotal - currentTotal;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const seconds = 59 - currentSeconds;
        
        nextPrayerNameEl.innerText = nextPrayer.ar;
        remainingTimeEl.innerText = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        
        // Calculate Iqama
        // Iqama is 15 min after prayer starts (5 min for Maghrib)
        const currentPrayerTotal = timeToMinutes(currentPrayer.time);
        const iqamaDelay = currentPrayer.name === 'Maghrib' ? 5 : 15;
        let iqamaTotal = currentPrayerTotal + iqamaDelay;
        
        // Check if we're in iqama period
        const timeSincePrayer = currentTotal - currentPrayerTotal;
        
        if (timeSincePrayer >= 0 && timeSincePrayer < iqamaDelay) {
            // We're in iqama period
            const iqamaRemaining = iqamaDelay - timeSincePrayer;
            const iqMins = Math.floor(iqamaRemaining);
            const iqSecs = 59 - currentSeconds;
            iqamaTimeEl.innerHTML = `⏱️ وقت الإقامة: <span class="iqama-countdown">${iqMins}:${iqSecs.toString().padStart(2,'0')}</span> (متبقي)`;
            iqamaTimeEl.classList.add('iqama-active');
        } else if (timeSincePrayer >= iqamaDelay && timeSincePrayer < 30) {
            // Just after iqama
            iqamaTimeEl.innerHTML = `✅ انتهت صلاة ${currentPrayer.ar}`;
            iqamaTimeEl.classList.remove('iqama-active');
        } else {
            // Show next prayer iqama time
            const nextIqamaDelay = nextPrayer.name === 'Maghrib' ? 5 : 15;
            let nextIqamaTotal = nextTotal + nextIqamaDelay;
            if (nextIqamaTotal >= 24 * 60) nextIqamaTotal -= 24 * 60;
            
            const iqH = Math.floor(nextIqamaTotal / 60) % 24;
            const iqM = nextIqamaTotal % 60;
            iqamaTimeEl.innerHTML = `⏱️ وقت الإقامة القادم: ${iqH.toString().padStart(2,'0')}:${iqM.toString().padStart(2,'0')}`;
            iqamaTimeEl.classList.remove('iqama-active');
        }
        
        // Update prayer list highlighting
        updatePrayerDisplay();
    }
    
    update();
    updateInterval = setInterval(update, 1000);
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

// ========== 6. Content Loading (Local Library) ==========
async function loadContentByType(type, mood = null) {
    try {
        let data;
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `athar_${type}_${today}_${mood || 'all'}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            data = JSON.parse(cached);
        } else {
            // Load from local JSON files (root directory, not /data/)
            let fileName;
            let itemsKey;
            
            if (type === 'ayah') {
                fileName = 'quran-short-ayahs.json';
                itemsKey = 'ayahs';
            } else if (type === 'hadith') {
                fileName = 'authentic-hadiths.json';
                itemsKey = 'hadiths';
            } else {
                fileName = 'hisn-al-muslim-adhkar.json';
                itemsKey = 'adhkar';
            }
            
            const response = await fetch(`./${fileName}`);
            if (!response.ok) throw new Error(`Failed to load ${fileName}`);
            
            const library = await response.json();
            let items = library[itemsKey];
            
            if (!items || items.length === 0) {
                throw new Error('No items found');
            }
            
            // Filter by mood if specified
            if (mood && type === 'ayah') {
                const filtered = items.filter(item => item.category === mood);
                if (filtered.length > 0) items = filtered;
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

// ========== 7. Export Card ==========
function updateExportCard() {
    exportCardContent.innerText = cardContentEl.innerText;
    exportCardRef.innerText = cardReferenceEl.innerText;
}

async function shareFancyCard() {
    updateExportCard();
    
    const cardElement = document.getElementById('exportCard');
    
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

// ========== 8. Card Backgrounds ==========
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

// ========== 9. Dhikr Counter ==========
let counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0');
dhikrCounterValue.innerText = counter;

dhikrCounterBtn.addEventListener('click', () => {
    counter++;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem(COUNTER_KEY, counter);
    
    if (navigator.vibrate) navigator.vibrate(10);
    
    dhikrCounterValue.classList.add('pulse');
    setTimeout(() => dhikrCounterValue.classList.remove('pulse'), 300);
    
    if (counter === 33 || counter === 66 || counter === 99 || counter === 100) {
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
});

dhikrCounterReset.addEventListener('click', () => {
    counter = 0;
    dhikrCounterValue.innerText = counter;
    localStorage.setItem(COUNTER_KEY, counter);
});

// ========== 10. Morning/Evening Dhikr ==========
function openDhikrList(category) {
    // Remove existing overlay
    const existing = document.querySelector('.dhikr-overlay');
    if (existing) existing.remove();
    
    fetch('./hisn-al-muslim-adhkar.json')
        .then(r => {
            if (!r.ok) throw new Error('Failed to load adhkar');
            return r.json();
        })
        .then(data => {
            const adhkar = data.adhkar.filter(a => a.category === category);
            
            if (adhkar.length === 0) {
                alert('لا توجد أذكار في هذا القسم');
                return;
            }
            
            let index = 0;
            
            function showDhikr() {
                const existingOverlay = document.querySelector('.dhikr-overlay');
                if (existingOverlay) existingOverlay.remove();
                
                const current = adhkar[index];
                const progress = `${index + 1}/${adhkar.length}`;
                
                const overlay = document.createElement('div');
                overlay.className = 'dhikr-overlay';
                overlay.innerHTML = `
                    <div class="dhikr-modal">
                        <div class="dhikr-header">
                            <span class="dhikr-category">${category}</span>
                            <button class="dhikr-close">✕</button>
                        </div>
                        <div class="dhikr-progress-bar">
                            <div class="dhikr-progress-fill" style="width: ${((index + 1) / adhkar.length) * 100}%"></div>
                        </div>
                        <div class="dhikr-progress-text">${progress}</div>
                        <div class="dhikr-text">${current.text}</div>
                        <div class="dhikr-count">التكرار: ${current.count} مرة</div>
                        <div class="dhikr-ref">${current.reference || ''}</div>
                        <div class="dhikr-actions">
                            <button class="dhikr-prev" ${index === 0 ? 'disabled' : ''}>السابق</button>
                            <button class="dhikr-next">${index === adhkar.length - 1 ? 'إنهاء ✓' : 'التالي'}</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(overlay);
                
                // Close button
                overlay.querySelector('.dhikr-close').addEventListener('click', () => {
                    overlay.remove();
                });
                
                // Click outside to close
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) overlay.remove();
                });
                
                // Next button
                overlay.querySelector('.dhikr-next').addEventListener('click', () => {
                    overlay.remove();
                    if (index < adhkar.length - 1) {
                        index++;
                        showDhikr();
                    } else {
                        // Finished
                        showCompletionMessage(category, adhkar.length);
                    }
                });
                
                // Prev button
                const prevBtn = overlay.querySelector('.dhikr-prev');
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        overlay.remove();
                        if (index > 0) {
                            index--;
                            showDhikr();
                        }
                    });
                }
            }
            
            showDhikr();
        })
        .catch(err => {
            console.error('Dhikr error:', err);
            alert('حدث خطأ في تحميل الأذكار. تأكد من وجود ملف hisn-al-muslim-adhkar.json');
        });
}

function showCompletionMessage(category, count) {
    const overlay = document.createElement('div');
    overlay.className = 'dhikr-overlay';
    overlay.innerHTML = `
        <div class="dhikr-modal completion">
            <div class="completion-icon">🎉</div>
            <div class="completion-title">أحسنت!</div>
            <div class="completion-text">أكملت ${category} (${count} ذكر)</div>
            <div class="completion-reward">جزاك الله خيراً</div>
            <button class="dhikr-close-btn">إغلاق</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.dhikr-close-btn').addEventListener('click', () => {
        overlay.remove();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

morningDhikrBtn.addEventListener('click', () => openDhikrList('أذكار الصباح'));
eveningDhikrBtn.addEventListener('click', () => openDhikrList('أذكار المساء'));

// ========== 11. Qibla Compass ==========
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
    
    if (diff < 5 || diff > 355) {
        compassRing.classList.add('is-aligned');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
        compassRing.classList.remove('is-aligned');
    }
}

compassContainer.addEventListener('click', activateQibla);

// ========== 12. Dark Mode ==========
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

// ========== 13. Service Worker ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(console.error);
    });
}

// ========== 14. Initialization ==========
function init() {
    // Start clock
    setInterval(updateTimeAndDate, 1000);
    updateTimeAndDate();
    
    // Load location and prayer times
    if (!loadSavedLocation()) {
        // Default to Makkah
        fetchPrayerTimes(21.4225, 39.8262, false);
    }
    
    // Load initial content
    loadContentByType('ayah');
}

// Start
init();
