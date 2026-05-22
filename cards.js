/**
 * cards.js — مكتبة بيانات البطاقات المركزية لمنصة أثر
 * تُستخدم من جميع الصفحات (index, library, my-athar)
 */

const cardsDB = [
    {
        id: 1,
        icon: "📖",
        text: "إذا مات الإنسان انقطع عنه عمله إلا من ثلاث: إلا من صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له",
        ref: "رواه مسلم",
        tag: "حديث",
        category: "حديث",
        date: "2024-01-01"
    },
    {
        id: 2,
        icon: "🕋",
        text: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
        ref: "الأنبياء: 107",
        tag: "آية",
        category: "آية",
        date: "2024-01-02"
    },
    {
        id: 3,
        icon: "🤲",
        text: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا",
        ref: "نوح: 28",
        tag: "دعاء",
        category: "دعاء",
        date: "2024-01-03"
    },
    {
        id: 4,
        icon: "📖",
        text: "مثل المؤمنين في توادهم وتراحمهم وتعاطفهم مثل الجسد إذا اشتكى منه عضو تداعى له سائر الجسد بالسهر والحمى",
        ref: "متفق عليه",
        tag: "حديث",
        category: "حديث",
        date: "2024-01-04"
    },
    {
        id: 5,
        icon: "🕋",
        text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        ref: "البقرة: 153",
        tag: "آية",
        category: "آية",
        date: "2024-01-05"
    },
    {
        id: 6,
        icon: "🤲",
        text: "اللهم إني أسألك الهدى والتقى والعفاف والغنى",
        ref: "رواه مسلم",
        tag: "دعاء",
        category: "دعاء",
        date: "2024-01-06"
    },
    {
        id: 7,
        icon: "📖",
        text: "الكلمة الطيبة صدقة",
        ref: "متفق عليه",
        tag: "حديث",
        category: "حديث",
        date: "2024-01-07"
    },
    {
        id: 8,
        icon: "🕋",
        text: "فَاذْكُرُونِي أَذْكُرْكُمْ",
        ref: "البقرة: 152",
        tag: "آية",
        category: "آية",
        date: "2024-01-08"
    }
];

/**
 * دالة لاختيار بطاقة اليوم بناءً على تاريخ اليوم
 * @returns {Object} بطاقة اليوم
 */
function getTodayCard() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % cardsDB.length;
    return cardsDB[index];
}

/**
 * دالة بحث في البطاقات
 * @param {string} query - كلمة البحث
 * @param {string} filter - نوع التصفية (الكل، حديث، آية، دعاء)
 * @returns {Array} نتائج البحث
 */
function searchCards(query = '', filter = 'all') {
    return cardsDB.filter(card => {
        const matchFilter = (filter === 'all' || card.tag === filter || card.category === filter);
        const matchQuery = card.text.includes(query) || card.ref.includes(query);
        return matchFilter && matchQuery;
    });
}

/**
 * دالة جلب بطاقة بواسطة المعرف
 * @param {number} id
 * @returns {Object|undefined}
 */
function getCardById(id) {
    return cardsDB.find(card => card.id === id);
}

/**
 * دالة إرجاع بطاقات عشوائية
 * @param {number} count - العدد المطلوب
 * @returns {Array}
 */
function getRandomCards(count = 3) {
    const shuffled = [...cardsDB].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
