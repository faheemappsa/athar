import MainScene from '../components/MainScene';
import Welcome from '../components/Welcome';
import AtharOfDay from '../components/AtharOfDay';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="home-shell" dir="rtl">
      <MainScene />
      <section className="content-stack" aria-label="محتوى أثر الرئيسي">
        <Welcome />
        <div className="feature-grid">
          <AtharOfDay />
          <PrayerTimes />
          <QiblaFinder />
        </div>
      </section>
      <Footer />
    </main>
  );
}
