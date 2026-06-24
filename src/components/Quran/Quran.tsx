import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const SURAHS = [
  { name: "الفاتحة", page: 1 }, { name: "البقرة", page: 2 }, { name: "آل عمران", page: 50 }, { name: "النساء", page: 77 },
  { name: "المائدة", page: 106 }, { name: "الأنعام", page: 128 }, { name: "الأعراف", page: 151 }, { name: "الأنفال", page: 177 },
  { name: "التوبة", page: 187 }, { name: "يونس", page: 208 }, { name: "هود", page: 221 }, { name: "يوسف", page: 235 },
  { name: "الرعد", page: 249 }, { name: "إبراهيم", page: 255 }, { name: "الحجر", page: 262 }, { name: "النحل", page: 267 },
  { name: "الإسراء", page: 282 }, { name: "الكهف", page: 293 }, { name: "مريم", page: 305 }, { name: "طه", page: 312 },
  { name: "الأنبياء", page: 322 }, { name: "الحج", page: 332 }, { name: "المؤمنون", page: 342 }, { name: "النور", page: 350 },
  { name: "الفرقان", page: 359 }, { name: "الشعراء", page: 367 }, { name: "النمل", page: 377 }, { name: "القصص", page: 385 },
  { name: "العنكبوت", page: 396 }, { name: "الروم", page: 404 }, { name: "لقمان", page: 411 }, { name: "السجدة", page: 415 },
  { name: "الأحزاب", page: 418 }, { name: "سبأ", page: 428 }, { name: "فاطر", page: 434 }, { name: "يس", page: 440 },
  { name: "الصافات", page: 446 }, { name: "ص", page: 453 }, { name: "الزمر", page: 458 }, { name: "غافر", page: 467 },
  { name: "فصلت", page: 477 }, { name: "الشورى", page: 483 }, { name: "الزخرف", page: 489 }, { name: "الدخان", page: 496 },
  { name: "الجاثية", page: 499 }, { name: "الأحقاف", page: 502 }, { name: "محمد", page: 507 }, { name: "الفتح", page: 511 },
  { name: "الحجرات", page: 515 }, { name: "ق", page: 518 }, { name: "الذاريات", page: 520 }, { name: "الطور", page: 523 },
  { name: "النجم", page: 526 }, { name: "القمر", page: 528 }, { name: "الرحمن", page: 531 }, { name: "الواقعة", page: 534 },
  { name: "الحديد", page: 537 }, { name: "المجادلة", page: 542 }, { name: "الحشر", page: 545 }, { name: "الممتحنة", page: 549 },
  { name: "الصف", page: 551 }, { name: "الجمعة", page: 553 }, { name: "المنافقون", page: 554 }, { name: "التغابن", page: 556 },
  { name: "الطلاق", page: 558 }, { name: "التحريم", page: 560 }, { name: "الملك", page: 562 }, { name: "القلم", page: 564 },
  { name: "الحاقة", page: 566 }, { name: "المعارج", page: 568 }, { name: "نوح", page: 570 }, { name: "الجن", page: 572 },
  { name: "المزمل", page: 574 }, { name: "المدثر", page: 575 }, { name: "القيامة", page: 577 }, { name: "الإنسان", page: 578 },
  { name: "المرسلات", page: 580 }, { name: "النبأ", page: 582 }, { name: "النازعات", page: 583 }, { name: "عبس", page: 585 },
  { name: "التكوير", page: 586 }, { name: "الانفطار", page: 587 }, { name: "المطففين", page: 587 }, { name: "الانشقاق", page: 589 },
  { name: "البروج", page: 590 }, { name: "الطارق", page: 591 }, { name: "الأعلى", page: 591 }, { name: "الغاشية", page: 592 },
  { name: "الفجر", page: 593 }, { name: "البلد", page: 594 }, { name: "الشمس", page: 595 }, { name: "الليل", page: 595 },
  { name: "الضحى", page: 596 }, { name: "الشرح", page: 596 }, { name: "التين", page: 597 }, { name: "العلق", page: 597 },
  { name: "القدر", page: 598 }, { name: "البينة", page: 598 }, { name: "الزلزلة", page: 599 }, { name: "العاديات", page: 599 },
  { name: "القارعة", page: 600 }, { name: "التكاثر", page: 600 }, { name: "العصر", page: 601 }, { name: "الهمزة", page: 601 },
  { name: "الفيل", page: 601 }, { name: "قريش", page: 602 }, { name: "الماعون", page: 602 }, { name: "الكوثر", page: 602 },
  { name: "الكافرون", page: 603 }, { name: "النصر", page: 603 }, { name: "المسد", page: 603 }, { name: "الإخلاص", page: 604 },
  { name: "الفلق", page: 604 }, { name: "الناس", page: 604 },
];

const JUZ_START_PAGES = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

const getMushafPageImage = (page: number) => `https://quran.ksu.edu.sa/png-big/${page}.png`;

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [inputPage, setInputPage] = useState<string>("");
  const [surahQuery, setSurahQuery] = useState<string>("");
  const [juzValue, setJuzValue] = useState<string>("");

  const currentSurah = useMemo(() => {
    return [...SURAHS].reverse().find((surah) => page >= surah.page)?.name || "الفاتحة";
  }, [page]);

  const filteredSurahs = useMemo(() => {
    const query = surahQuery.trim();
    if (!query) return [];
    return SURAHS.filter((surah) => surah.name.includes(query)).slice(0, 6);
  }, [surahQuery]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setImageLoaded(false);
    setImageError(false);
    setPage(newPage);
    setInputPage("");
    setSurahQuery("");
    setJuzValue("");
  };

  const handleJump = () => {
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && num >= 1 && num <= 604) goToPage(num);
  };

  const handleJuzJump = (value: string) => {
    setJuzValue(value);
    const juz = parseInt(value, 10);
    if (!isNaN(juz) && juz >= 1 && juz <= 30) goToPage(JUZ_START_PAGES[juz - 1]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-primary-text">المصحف</h2>
          <p className="mt-0.5 text-xs text-secondary-text">{currentSurah}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">صفحة {page} / 604</span>
      </div>

      <div className="mb-3 rounded-[24px] bg-primary-bg/70 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              value={surahQuery}
              onChange={(event) => setSurahQuery(event.target.value)}
              placeholder="ابحث بالسورة"
              className="w-full rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-primary-text shadow-sm focus:outline-none"
            />
            {filteredSurahs.length > 0 && (
              <div className="absolute right-0 top-12 z-20 w-full overflow-hidden rounded-[20px] bg-white shadow-xl">
                {filteredSurahs.map((surah) => (
                  <button
                    key={`${surah.name}-${surah.page}`}
                    onClick={() => goToPage(surah.page)}
                    className="block w-full border-b border-primary-bg px-3 py-2 text-right text-sm font-bold text-primary-text last:border-b-0"
                  >
                    {surah.name}
                    <span className="me-2 text-xs text-secondary-text">ص {surah.page}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={juzValue}
            onChange={(event) => handleJuzJump(event.target.value)}
            className="w-full rounded-full bg-white px-3 py-3 text-center text-sm font-semibold text-primary-text shadow-sm focus:outline-none"
          >
            <option value="">اختر الجزء</option>
            {JUZ_START_PAGES.map((startPage, index) => (
              <option key={startPage} value={index + 1}>
                الجزء {index + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[26px] bg-[#FBF7EC] p-2 shadow-inner">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-2 z-10 grid place-items-center rounded-[22px] bg-primary-bg/85 text-sm font-semibold text-secondary-text">
            جاري تجهيز صفحة المصحف...
          </div>
        )}

        {imageError ? (
          <div className="rounded-[22px] bg-primary-bg p-5 text-center text-secondary-text">تعذر تحميل صفحة المصحف</div>
        ) : (
          <img
            key={page}
            src={getMushafPageImage(page)}
            alt={`صفحة ${page} من المصحف`}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(false);
              setImageError(true);
            }}
            className={`mx-auto block w-full max-w-[390px] rounded-[18px] bg-white object-contain shadow-sm transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 items-center gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          السابق
        </button>

        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            min="1"
            max="604"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder="صفحة"
            className="w-16 rounded-full border border-secondary-text/40 bg-white px-2 py-3 text-center text-sm text-primary-text focus:border-action focus:outline-none"
          />
          <button
            onClick={handleJump}
            className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            اذهب
          </button>
        </div>

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= 604}
          className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </motion.div>
  );
}
