import Quran from "../components/Quran/Quran";
import Footer from "../components/Footer/Footer";

export default function QuranPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-[#1A3B5C]">المصحف</h2>
      <Quran />
      <Footer />
    </div>
  );
}
