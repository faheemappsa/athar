import Quran from "../components/Quran/Quran";
import Footer from "../components/Footer/Footer";

export default function QuranPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-[32px] bg-action px-6 py-8 text-center text-white shadow-xl">
        <p className="text-xs text-white/70">أثر</p>
        <h2 className="mt-2 text-2xl font-bold">المصحف</h2>
        <p className="mt-2 text-sm text-white/80">قراءة هادئة وسهلة</p>
      </div>
      <Quran />
      <Footer />
    </div>
  );
}
