import "./index.css";
import PrayerTimes from "./components/PrayerTimes/PrayerTimes";
import RadioPlayer from "./components/Radio/RadioPlayer";
import AtharCard from "./components/AtharCard/AtharCard";

export default function App() {
  return (
    <div className="min-h-screen bg-primary-bg p-4 font-arabic">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-center text-primary-text">أثر</h1>
        <p className="text-center text-secondary-text text-sm">
          صدقة جارية عن مسلّم البويني رحمه الله
        </p>
        <PrayerTimes />
        <RadioPlayer />
        <AtharCard />
      </div>
    </div>
  );
}
