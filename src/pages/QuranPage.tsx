import Quran from "../components/Quran/Quran";
import Footer from "../components/Footer/Footer";

export default function QuranPage() {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-center text-primary-text">المصحف</h2>
      <Quran />
      <Footer />
    </div>
  );
}
