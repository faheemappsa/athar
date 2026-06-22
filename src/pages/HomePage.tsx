import PrayerTimes from "../components/PrayerTimes/PrayerTimes";
import RadioPlayer from "../components/Radio/RadioPlayer";
import AtharCard from "../components/AtharCard/AtharCard";
import Footer from "../components/Footer/Footer";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center text-[#1A3B5C]">أثر</h1>
      <p className="text-center text-[#6B7280] text-sm">
        صدقة جارية عن مسلّم البويني رحمه الله
      </p>
      <PrayerTimes />
      <RadioPlayer />
      <AtharCard />
      <Footer />
    </div>
  );
}
