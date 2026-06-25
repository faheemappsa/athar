import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type QuranAyah = { text: string; numberInSurah: number };
type QuranPageResponse = { data?: { ayahs?: QuranAyah[] } };
type SurahOption = { name: string; page: number };

const TOTAL_PAGES = 604;
const SURAHS_DATA = "الفاتحة:1|البقرة:2|آل عمران:50|النساء:77|المائدة:106|الأنعام:128|الأعراف:151|الأنفال:177|التوبة:187|يونس:208|هود:221|يوسف:235|الرعد:249|إبراهيم:255|الحجر:262|النحل:267|الإسراء:282|الكهف:293|مريم:305|طه:312|الأنبياء:322|الحج:332|المؤمنون:342|النور:350|الفرقان:359|الشعراء:367|النمل:377|القصص:385|العنكبوت:396|الروم:404|لقمان:411|السجدة:415|الأحزاب:418|سبأ:428|فاطر:434|يس:440|الصافات:446|ص:453|الزمر:458|غافر:467|فصلت:477|الشورى:483|الزخرف:489|الدخان:496|الجاثية:499|الأحقاف:502|محمد:507|الفتح:511|الحجرات:515|ق:518|الذاريات:520|الطور:523|النجم:526|القمر:528|الرحمن:531|الواقعة:534|الحديد:537|المجادلة:542|الحشر:545|الممتحنة:549|الصف:551|الجمعة:553|المنافقون:554|التغابن:556|الطلاق:558|التحريم:560|الملك:562|القلم:564|الحاقة:566|المعارج:568|نوح:570|الجن:572|المزمل:574|المدثر:575|القيامة:577|الإنسان:578|المرسلات:580|النبأ:582|النازعات:583|عبس:585|التكوير:586|الانفطار:587|المطففين:587|الانشقاق:589|البروج:590|الطارق:591|الأعلى:591|الغاشية:592|الفجر:593|البلد:594|الشمس:595|الليل:595|الضحى:596|الشرح:596|التين:597|العلق:597|القدر:598|البينة:598|الزلزلة:599|العاديات:599|القارعة:600|التكاثر:600|العصر:601|الهمزة:601|الفيل:601|قريش:602|الماعون:602|الكوثر:602|الكافرون:603|النصر:603|المسد:603|الإخلاص:604|الفلق:604|الناس:604";
const SURAHS: SurahOption[] = SURAHS_DATA.split("|").map((item) => {
  const [name, page] = item.split(":");
  return { name, page: Number(page) };
});

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [inputPage, setInputPage] = useState("");
  const [surahSearch, setSurahSearch] = useState("");
  const [pageText, setPageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim();
    if (!query) return SURAHS.slice(0, 8);
    return SURAHS.filter((surah) => surah.name.includes(query)).slice(0, 8);
  }, [surahSearch]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`)
      .then((response) => response.json())
      .then((data: QuranPageResponse) => {
        if (!isMounted) return;
        const ayahs = data.data?.ayahs || [];
        const text = ayahs.map((ayah) => `${ayah.text} ﴿${ayah.numberInSurah}﴾`).join(" ");
        setPageText(text);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > TOTAL_PAGES) return;
    setPage(nextPage);
    setInputPage("");
  };

  const handleJump = () => {
    const nextPage = Number(inputPage);
    if (!Number.isNaN(nextPage)) goToPage(nextPage);
  };

  const handleSurahPick = (surah: SurahOption) => {
    setSurahSearch(surah.name);
    goToPage(surah.page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-3 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-primary-text">المصحف</h2>
        <span className="rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">
          صفحة {page} / {TOTAL_PAGES}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[30px] bg-[#FBF7EC] p-2.5 shadow-inner ring-1 ring-black/5">
        {isLoading ? (
          <div className="grid min-h-[470px] place-items-center rounded-[24px] bg-[#FDFBF7] text-sm font-semibold text-secondary-text">
            جاري تحميل الآيات...
          </div>
        ) : hasError ? (
          <div className="grid min-h-[470px] place-items-center rounded-[24px] bg-[#FDFBF7] px-5 text-center text-sm font-semibold leading-7 text-secondary-text">
            تعذر تحميل صفحة المصحف. تأكد من اتصال الإنترنت ثم حاول مرة أخرى.
          </div>
        ) : (
          <div
            className="max-h-[64vh] min-h-[470px] overflow-y-auto rounded-[24px] bg-[#FDFBF7] px-5 py-6 text-center text-[20px] leading-[2.45] text-[#1E1B18] shadow-sm"
            style={{ fontFamily: '"Traditional Arabic", "Amiri", "Scheherazade New", serif' }}
          >
            {pageText}
          </div>
        )}
      </div>

      <div className="mt-3 rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-black/5">
        <div className="mb-2 rounded-[24px] bg-primary-bg/40 p-2">
          <input
            type="search"
            value={surahSearch}
            onChange={(event) => setSurahSearch(event.target.value)}
            placeholder="ابحث باسم السورة"
            className="h-11 w-full rounded-full border border-secondary-text/20 bg-white px-4 text-center text-sm font-bold text-primary-text placeholder:text-secondary-text/70 focus:border-action focus:outline-none"
          />
          {surahSearch && filteredSurahs.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.name}
                  onClick={() => handleSurahPick(surah)}
                  className="rounded-full bg-white px-3 py-2 text-xs font-bold text-primary-text shadow-sm transition hover:text-action"
                >
                  {surah.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-full bg-action px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            السابق
          </button>

          <div className="flex items-center justify-center gap-1.5">
            <input
              type="number"
              min="1"
              max={TOTAL_PAGES}
              value={inputPage}
              onChange={(event) => setInputPage(event.target.value)}
              placeholder="صفحة"
              className="h-12 w-[68px] rounded-full border border-secondary-text/30 bg-primary-bg/40 px-2 text-center text-sm font-semibold text-primary-text focus:border-action focus:bg-white focus:outline-none"
            />
            <button
              onClick={handleJump}
              className="h-12 rounded-full bg-action px-4 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            >
              اذهب
            </button>
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= TOTAL_PAGES}
            className="rounded-full bg-action px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>
    </motion.div>
  );
}
