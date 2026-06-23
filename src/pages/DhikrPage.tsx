import Dhikr from "../components/Dhikr/Dhikr";
import Footer from "../components/Footer/Footer";
import AppHero from "../components/Shared/AppHero";

export default function DhikrPage() {
  return (
    <div className="space-y-5">
      <AppHero title="الأذكار" subtitle="تجربة يومية خفيفة وهادئة" />
      <Dhikr />
      <Footer />
    </div>
  );
}
