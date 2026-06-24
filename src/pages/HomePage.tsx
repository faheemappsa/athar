import PrayerTimes from "../components/PrayerTimes/PrayerTimes";
import RadioPlayer from "../components/Radio/RadioPlayer";
import AtharCard from "../components/AtharCard/AtharCard";
import Footer from "../components/Footer/Footer";
import AppHero from "../components/Shared/AppHero";

export default function HomePage() {
  return (
    <div className="space-y-5">
      <AppHero title="أثر" subtitle="رفيق يومي للأذكار وورد القرآن ومشاركة الأثر" />
      <section className="rounded-card bg-white/86 px-5 py-5 text-center shadow-lg shadow-action/5 ring-1 ring-action/10">
        <p className="text-sm font-extrabold leading-relaxed text-primary-text">
          وقف خيري عن مسلّم عوده البويني رحمه الله
        </p>
        <div className="mt-3 space-y-1 text-sm font-bold leading-relaxed text-secondary-text">
          <p>لعلنا نكون منهم...</p>
          <p>﴿ وولدٌ صالحٌ يدعو له ﴾</p>
        </div>
      </section>
      <PrayerTimes />
      <RadioPlayer />
      <AtharCard />
      <Footer />
    </div>
  );
}