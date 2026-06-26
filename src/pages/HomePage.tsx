import PrayerTimes from "../components/PrayerTimes/PrayerTimes";
import RadioPlayer from "../components/Radio/RadioPlayer";
import AtharCard from "../components/AtharCard/AtharCard";
import Footer from "../components/Footer/Footer";

export default function HomePage() {
  return (
    <div className="space-y-5">
      <PrayerTimes />
      <RadioPlayer />
      <AtharCard />
      <Footer showWaqf />
    </div>
  );
}
