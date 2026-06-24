import PrayerTimes from "../components/PrayerTimes/PrayerTimes";
import RadioPlayer from "../components/Radio/RadioPlayer";
import AtharCard from "../components/AtharCard/AtharCard";
import Footer from "../components/Footer/Footer";
import AppHero from "../components/Shared/AppHero";

export default function HomePage() {
  return (
    <div className="space-y-5">
      <AppHero title="أثر" subtitle="رفيق يومي للأذكار وورد القرآن ومشاركة الأثر" />
      <PrayerTimes />
      <RadioPlayer />
      <AtharCard />
      <Footer showWaqf />
    </div>
  );
}
