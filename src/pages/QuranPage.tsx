import Quran from "../components/Quran/Quran";
import Footer from "../components/Footer/Footer";
import AppHero from "../components/Shared/AppHero";

export default function QuranPage() {
  return (
    <div className="space-y-5">
      <AppHero title="المصحف" subtitle="قراءة هادئة ومتواصلة" />
      <Quran />
      <Footer />
    </div>
  );
}
