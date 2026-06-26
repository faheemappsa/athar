import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type QuranSurah = { number: number; name: string };
type QuranAyah = { text: string; numberInSurah: number; surah?: QuranSurah };
type QuranPageResponse = { data?: { ayahs?: QuranAyah[] } };
type SurahOption = { name: string; page: number };
type QuranProps = { focusMode?: boolean };
type QuranAyahView = { text: string; numberInSurah: number; surahName: string; surahNumber: number };
type ReadingPosition = { page: number; surahName: string; updatedAt: string };

const TOTAL_PAGES = 604;
const QURAN_CACHE_KEY = "athar-quran-page-cache";
const QURAN_READING_POSITION_KEY = "athar-quran-reading-position";
const SURAHS_DATA = "الفاتحة:1|البقرة:2|آل عمران:50|النساء:77|المائدة:106|الأنعام:128|الأعراف:151|الأنفال:177|التوبة:187|يونس:208|هود:221|يوسف:235|الرعد:249|إبراهيم:255|الحجر:262|النحل:267|الإسراء:282|الكهف:293|مريم:305|طه:312|الأنبياء:322|الحج:332|المؤمنون:342|النور:350|الفرقان:359|الشعراء:367|النمل:377|القصص:385|العنكبوت:396|الروم:404|لقمان:411|السجدة:415|الأحزاب:418|سبأ:428|فاطر:434|يس:440|الصافات:446|ص:453|الزمر:458|غافر:467|فصلت:477|الشورى:483|الزخرف:489|الدخان:496|الجاثية:499|الأحقاف:502|محمد:507|الفتح:511|الحجرات:515|ق:518|الذاريات:520|الطور:523|النجم:526|القمر:528|الرحمن:531|الواقعة:534|الحديد:537|المجادلة:542|الحشر:545|الممتحنة:549|الصف:551|الجمعة:553|المنافقون:554|التغابن:556|الطلاق:558|التحريم:560|الملك:562|القلم:564|الحاقة:566|المعارج:568|نوح:570|الجن:572|المزمل:574|المدثر:575|القيامة:577|الإنسان:578|المرسلات:580|النبأ:582|النازعات:583|عبس:585|التكوير:586|الانفطار:587|المطففين:587|الانشقاق:589|البروج:590|الطارق:591|الأعلى:591|الغاشية:592|الفجر:593|البلد:594|الشمس:595|الليل:595|الضحى:596|الشرح:596|التين:597|العلق:597|القدر:598|البينة:598|الزلزلة:599|العاديات:599|القارعة:600|التكاثر:600|العصر:601|الهمزة:601|الفيل:601|قريش:602|الماعون:602|الكوثر:602|الكافرون:603|النصر:603|المسد:603|الإخلاص:604|الفلق:604|الناس:604";
const SURAHS: SurahOption[] = SURAHS_DATA.split("|").map((item) => {
  const [name, page] = item.split(":");
  return { name, page: Number(page) };
});

const normalizeAyah = (ayah: QuranAyah): QuranAyahView => ({
  text: ayah.text,
  numberInSurah: ayah.numberInSurah,
  surahName: ayah.surah?.name || "",
  surahNumber: ayah.surah?.number || 0,
});

const readQuranCache = (): Record<string, QuranAyahView[]> => {
  try {
    const value = localStorage.getItem(QURAN_CACHE_KEY);
    if (!value) return {};
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, ayahs]) => Array.isArray(ayahs)) as [string, QuranAyahView[]][]
    );
  } catch {
    return {};
  }
};

const readSavedPosition = (): ReadingPosition | null => {
  try {
    const value = localStorage.getItem(QURAN_READING_POSITION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as ReadingPosition;
    if (!parsed || typeof parsed.page !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveQuranPage = (pageNumber: number, ayahs: QuranAyahView[]) => {
  try {
    const cache = readQuranCache();
    cache[String(pageNumber)] = ayahs;
    const entries = Object.entries(cache).slice(-120);
    localStorage.setItem(QURAN_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {}
};

const saveReadingPosition = (position: ReadingPosition) => {
  try {
    localStorage.setItem(QURAN_READING_POSITION_KEY, JSON.stringify(position));
  } catch {}
};

const readQuranPage = (pageNumber: number) => readQuranCache()[String(pageNumber)] || [];

const shouldShowBasmala = (ayah: QuranAyahView) =>
  ayah.numberInSurah === 1 && ayah.surahNumber !== 1 && ayah.surahNumber !== 9;

export default function Quran({ focusMode = false }: QuranProps) {
  const savedPosition = useMemo(() => readSavedPosition(), []);
  const [page, setPage] = useLocalStorage<number>("quran-page", savedPosition?.page || 1);
  const [inputPage, setInputPage] = useState("");
  const [surahSearch, setSurahSearch] = useState("");
  const [activeSurahName, setActiveSurahName] = useState(savedPosition?.surahName || "");
  const [pageAyahs, setPageAyahs] = useState<QuranAyahView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const readerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; at: number } | null>(null);

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim();
    if (!query) return [];
    return SURAHS.filter((surah) => surah.name.includes(query)).slice(0, 8);
  }, [surahSearch]);

  const visibleAyahs = useMemo(() => {
    if (!activeSurahName) return pageAyahs;
    const firstSurahAyah = pageAyahs.findIndex((ayah) => ayah.surahName === activeSurahName);
    return firstSurahAyah >= 0 ? pageAyahs.slice(firstSurahAyah) : pageAyahs;
  }, [activeSurahName, pageAyahs]);

  const ayahGroups = useMemo(() => {
    return visibleAyahs.reduce<QuranAyahView[][]>((groups, ayah) => {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup[0]?.surahName !== ayah.surahName) {
        groups.push([ayah]);
      } else {
        lastGroup.push(ayah);
      }
      return groups;
    }, []);
  }, [visibleAyahs]);

  const currentSurahName = visibleAyahs[0]?.surahName || activeSurahName || pageAyahs[0]?.surahName || "المصحف";

  useEffect(() => {
    saveReadingPosition({ page, surahName: currentSurahName, updatedAt: new Date().toISOString() });
  }, [page, currentSurahName]);

  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, activeSurahName]);

  useEffect(() => {
    let isMounted = true;
    const cachedAyahs = readQuranPage(page);
    setIsLoading(cachedAyahs.length === 0);
    setHasError(false);
    if (cachedAyahs.length > 0) setPageAyahs(cachedAyahs);

    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`)
      .then((response) => response.json())
      .then((data: QuranPageResponse) => {
        if (!isMounted) return;
        const ayahs = (data.data?.ayahs || []).map(normalizeAyah);
        setPageAyahs(ayahs);
        saveQuranPage(page, ayahs);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        const fallbackAyahs = readQuranPage(page);
        if (fallbackAyahs.length > 0) {
          setPageAyahs(fallbackAyahs);
          setHasError(false);
        } else {
          setHasError(true);
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const goToPage = (nextPage: number, surahName = "") => {
    if (nextPage < 1 || nextPage > TOTAL_PAGES) return;
    setPage(nextPage);
    setActiveSurahName(surahName);
    setInputPage("");
    setIsHeaderOpen(false);
  };

  const handleJump = () => {
    const nextPage = Number(inputPage);
    if (!Number.isNaN(nextPage)) goToPage(nextPage);
  };

  const handleSurahPick = (surah: SurahOption) => {
    setSurahSearch(surah.name);
    goToPage(surah.page, surah.name);
  };

  const handleReaderTap = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isHeaderOpen) {
      setIsHeaderOpen(false);
      return;
    }

    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const deltaX = Math.abs(event.clientX - start.x);
    const deltaY = Math.abs(event.clientY - start.y);
    const elapsed = Date.now() - start.at;
    if (deltaX > 12 || deltaY > 12 || elapsed > 450) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftSide = event.clientX < rect.left + rect.width / 2;
    goToPage(isLeftSide ? page + 1 : page - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`w-full overflow-hidden rounded-[26px] border border-[#C8A84E]/12 bg-[#F7F0E4] shadow-[0_18px_38px_rgba(33,73,63,0.07)] ${focusMode ? "p-1" : "p-1.5"}`}
    >
      <div className="overflow-hidden rounded-[23px] border border-[#C8A84E]/14 bg-[#FEFCF7] shadow-inner">
        <div className="sticky top-0 z-20 bg-[#FEFCF7]/92 px-2 pt-2 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setIsHeaderOpen((value) => !value)}
            className="mx-auto flex min-h-10 w-fit items-center justify-center rounded-full border border-[#C8A84E]/18 bg-[#F8F0E3]/95 px-5 text-sm font-extrabold text-[#21493F] shadow-sm transition active:scale-[0.98]"
            aria-expanded={isHeaderOpen}
            aria-label="فتح خيارات المصحف"
          >
            سورة {currentSurahName}
            <span className="mr-2 text-[11px] text-[#8EA29A]">{isHeaderOpen ? "▲" : "▼"}</span>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isHeaderOpen && !focusMode ? "mt-2 max-h-56 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="rounded-[22px] border border-[#C8A84E]/14 bg-[#FBFCFA] p-2 shadow-sm">
              <input
                type="search"
                value={surahSearch}
                onChange={(event) => setSurahSearch(event.target.value)}
                placeholder="ابحث باسم السورة"
                className="h-11 w-full rounded-full border border-[#A8D5C2]/45 bg-white px-4 text-center text-sm font-bold text-primary-text placeholder:text-secondary-text/70 focus:border-action focus:outline-none"
                aria-label="البحث باسم السورة"
              />

              {filteredSurahs.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.name}
                      onClick={() => handleSurahPick(surah)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-bold text-primary-text shadow-sm ring-1 ring-[#C8A84E]/10 transition hover:text-action"
                      aria-label={`الانتقال إلى سورة ${surah.name}`}
                    >
                      {surah.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-center justify-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={TOTAL_PAGES}
                  value={inputPage}
                  onChange={(event) => setInputPage(event.target.value)}
                  placeholder="رقم الصفحة"
                  className="h-11 w-28 rounded-full border border-[#C8A84E]/20 bg-[#F8F0E3] px-2 text-center text-sm font-semibold text-primary-text focus:border-action focus:bg-white focus:outline-none"
                  aria-label="رقم صفحة المصحف"
                />
                <button
                  onClick={handleJump}
                  className="h-11 rounded-full bg-action px-5 text-sm font-bold text-white shadow-md shadow-action/15 transition hover:opacity-90"
                  aria-label="الانتقال إلى صفحة محددة من المصحف"
                >
                  اذهب
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid place-items-center text-sm font-semibold text-secondary-text ${focusMode ? "min-h-[calc(100vh-9.5rem)]" : "min-h-[560px]"}`}>
            جاري تحميل الآيات...
          </div>
        ) : hasError ? (
          <div className={`grid place-items-center px-5 text-center text-sm font-semibold leading-7 text-secondary-text ${focusMode ? "min-h-[calc(100vh-9.5rem)]" : "min-h-[560px]"}`}>
            افتح هذه الصفحة مرة واحدة عند توفر الاتصال لتبقى محفوظة لاحقًا.
          </div>
        ) : (
          <div
            ref={readerRef}
            className={`quran-text overflow-y-auto px-3 pb-4 pt-3 text-center text-[#12100D] transition-all duration-300 ${focusMode ? "max-h-[calc(100vh-9.5rem)] min-h-[calc(100vh-9.5rem)] text-[24px] leading-[2.85]" : "max-h-[72vh] min-h-[560px] text-[23px] leading-[2.76]"}`}
            style={{ fontFamily: '"Traditional Arabic", "Amiri", "Scheherazade New", serif' }}
            onPointerDown={(event) => {
              pointerStartRef.current = { x: event.clientX, y: event.clientY, at: Date.now() };
            }}
            onPointerUp={handleReaderTap}
          >
            <div className="space-y-6">
              {ayahGroups.map((group) => {
                const firstAyah = group[0];
                return (
                  <section key={`${firstAyah.surahName}-${firstAyah.numberInSurah}`} className="space-y-3">
                    {firstAyah.numberInSurah === 1 && (
                      <div className="mx-auto w-full max-w-[280px] rounded-[16px] border border-[#C8A84E]/18 bg-[#F8F0E3]/80 px-5 py-1.5 text-[15px] font-bold text-[#21493F]">
                        سورة {firstAyah.surahName}
                      </div>
                    )}
                    {shouldShowBasmala(firstAyah) && (
                      <p className="text-[21px] font-bold text-[#21493F]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    )}
                    <p className="text-pretty">
                      {group.map((ayah) => (
                        <span key={`${ayah.surahNumber}-${ayah.numberInSurah}`} className="inline">
                          {ayah.text}{" "}
                          <span className="mx-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#C8A84E]/18 bg-[#F8F0E3]/80 px-1.5 align-middle text-[11px] font-bold leading-none text-[#8B7141]">
                            {ayah.numberInSurah}
                          </span>{" "}
                        </span>
                      ))}
                    </p>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        <div className="mx-2 mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[20px] border border-[#C8A84E]/10 bg-[#FBFCFA]/86 p-1.5 shadow-sm">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-full border border-[#C8A84E]/16 bg-[#F8F0E3]/90 px-4 py-2.5 text-sm font-bold text-[#21493F] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="الانتقال إلى الصفحة السابقة من المصحف"
          >
            السابق
          </button>

          <div className="rounded-full bg-[#A8D5C2]/12 px-3 py-2 text-xs font-bold text-[#8EA29A]">
            {page}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= TOTAL_PAGES}
            className="rounded-full border border-[#C8A84E]/16 bg-[#F8F0E3]/90 px-4 py-2.5 text-sm font-bold text-[#21493F] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="الانتقال إلى الصفحة التالية من المصحف"
          >
            التالي
          </button>
        </div>
      </div>
    </motion.div>
  );
}
