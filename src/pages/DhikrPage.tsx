import Dhikr from "../components/Dhikr/Dhikr";
import DhikrFocusHero from "../components/Dhikr/DhikrFocusHero";
import Footer from "../components/Footer/Footer";

export default function DhikrPage() {
  return (
    <div className="space-y-5">
      <DhikrFocusHero />
      <Dhikr />
      <Footer />
    </div>
  );
}
