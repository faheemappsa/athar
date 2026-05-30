// ============================================================
// مكون الختمة الذكية (تتبع الصفحة الفعلية للمستخدم)
// ============================================================
interface KhatmahProgress {
  currentPage: number;       // الصفحة التي وصل إليها
  totalPages: number;        // إجمالي صفحات المصحف (604)
  completedKhatmah: number;  // عدد الختمات المكتملة
}

function KhatmahSection() {
  const [progress, setProgress] = useState<KhatmahProgress | null>(null);
  const [currentPageText, setCurrentPageText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [pagesToRead, setPagesToRead] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // تحميل/تهيئة بيانات الختمة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem("athar-khatmah-progress-v2");
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const newProgress: KhatmahProgress = {
        currentPage: 1,
        totalPages: 604,
        completedKhatmah: 0,
      };
      localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(newProgress));
      setProgress(newProgress);
    }
  }, []);

  // جلب أول آية من الصفحة الحالية للعرض
  useEffect(() => {
    if (!progress) return;
    const fetchPagePreview = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://alquran.cloud/api/page/${progress.currentPage}/ar.alafasy`);
        const data = await res.json();
        if (data.code === 200 && data.data.ayahs.length > 0) {
          const firstAyah = data.data.ayahs[0];
          setCurrentPageText(firstAyah.text.slice(0, 150) + "...");
        } else {
          setCurrentPageText("لم نتمكن من جلب النص، حاول مرة أخرى.");
        }
      } catch (err) {
        setCurrentPageText("حدث خطأ، تأكد من اتصالك بالإنترنت.");
      }
      setLoading(false);
    };
    fetchPagePreview();
  }, [progress?.currentPage]);

  // تسجيل قراءة صفحات جديدة
  const recordPages = () => {
    if (!progress) return;
    if (pagesToRead < 1) {
      showMessage("يرجى إدخال عدد صفحات صحيح (1 على الأقل)", "error");
      return;
    }

    let newPage = progress.currentPage + pagesToRead;
    let newCompletedKhatmah = progress.completedKhatmah;
    let messageText = "";

    if (newPage > progress.totalPages) {
      const overshoot = newPage - progress.totalPages;
      newCompletedKhatmah += 1;
      newPage = overshoot > 0 ? overshoot : 1;
      messageText = `🎉 مبارك! أكملت ختمة رقم ${newCompletedKhatmah}. استمر من الصفحة ${newPage}`;
    } else {
      messageText = `📖 تم تسجيل ${pagesToRead} صفحة. وصلت إلى الصفحة ${newPage}`;
    }

    const updatedProgress: KhatmahProgress = {
      ...progress,
      currentPage: newPage,
      completedKhatmah: newCompletedKhatmah,
    };
    localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(updatedProgress));
    setProgress(updatedProgress);

    // تحديث نقاط الإنجازات (كل صفحة = نقطتان)
    const currentPoints = parseInt(localStorage.getItem("athar-khatmah-points") || "0");
    localStorage.setItem("athar-khatmah-points", (currentPoints + pagesToRead * 2).toString());

    showMessage(messageText, "success");

    // تحديث إحصائيات الصفحة الرئيسية (سجلي)
    const totalPagesRead = parseInt(localStorage.getItem("athar-total-pages-read") || "0");
    localStorage.setItem("athar-total-pages-read", (totalPagesRead + pagesToRead).toString());

    // إعادة تعيين عدد الصفحات إلى 1 بعد التسجيل
    setPagesToRead(1);
  };

  const resetKhatmah = () => {
    if (confirm("هل تريد إعادة تعيين الختمة من البداية؟ سيتم فقدان التقدم الحالي.")) {
      const newProgress: KhatmahProgress = {
        currentPage: 1,
        totalPages: 604,
        completedKhatmah: 0,
      };
      localStorage.setItem("athar-khatmah-progress-v2", JSON.stringify(newProgress));
      setProgress(newProgress);
      localStorage.setItem("athar-khatmah-points", "0");
      showMessage("تم إعادة تعيين الختمة. ابدأ من الصفحة 1", "success");
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (!progress) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-athar-bg-200 dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-athar-secondary-500" />
          <h3 className="font-semibold text-athar-text dark:text-gray-200">ختمتي الذكية</h3>
        </div>
        <button
          onClick={resetKhatmah}
          className="text-xs text-athar-text-muted underline"
          title="إعادة تعيين الختمة"
        >
          إعادة تعيين
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-athar-text-muted">جاري التحميل...</div>
      ) : (
        <>
          {/* الصفحة الحالية */}
          <div className="text-center">
            <p className="text-4xl font-bold text-athar-accent-500">{progress.currentPage}</p>
            <p className="text-xs text-athar-text-muted">الصفحة الحالية</p>
            {progress.completedKhatmah > 0 && (
              <p className="text-xs text-athar-secondary-500 mt-1">
                🎉 عدد الختمات: {progress.completedKhatmah}
              </p>
            )}
          </div>

          {/* معاينة الآية */}
          <div className="bg-athar-bg-100 dark:bg-gray-700/50 rounded-xl p-3 text-right">
            <p className="text-sm text-athar-text leading-relaxed">{currentPageText}</p>
          </div>

          {/* اختيار عدد الصفحات */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-athar-text">عدد الصفحات المقروءة:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagesToRead((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-full bg-athar-primary-100 text-athar-primary-600 font-bold"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-athar-text">{pagesToRead}</span>
              <button
                onClick={() => setPagesToRead((prev) => prev + 1)}
                className="w-8 h-8 rounded-full bg-athar-primary-100 text-athar-primary-600 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* زر تسليم القراءة */}
          <button
            onClick={recordPages}
            className="w-full py-3 rounded-xl bg-athar-accent-500 text-white font-semibold text-base hover:bg-athar-accent-600 transition-colors active:scale-95"
          >
            📖 سجل قراءة {pagesToRead} صفحة
          </button>

          {/* رسالة نجاح/خطأ */}
          {message && (
            <div
              className={`text-center text-sm p-2 rounded-xl ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* روابط إضافية */}
          <div className="flex justify-between gap-2 pt-2">
            <button
              onClick={() => window.open(`https://quran.com/${progress.currentPage}`, "_blank")}
              className="flex-1 py-2 rounded-xl bg-athar-primary-100 text-athar-primary-600 text-sm font-medium text-center hover:bg-athar-primary-200 transition-colors"
            >
              اقرأ الصفحة كاملة 📖
            </button>
            <button
              onClick={() => window.open("https://quran.com", "_blank")}
              className="flex-1 py-2 rounded-xl bg-athar-bg-200 text-athar-text-muted text-sm font-medium text-center hover:bg-athar-bg-300 transition-colors"
            >
              فتح المصحف 📚
            </button>
          </div>
        </>
      )}
    </div>
  );
}
