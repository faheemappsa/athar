import MainScene from '../components/MainScene';
import Welcome from '../components/Welcome';
import AtharOfDay from '../components/AtharOfDay';
import QuranReader from '../components/QuranReader';
import QuranTracker from '../components/QuranTracker';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import Footer from '../components/Footer';
import NameModal from '../components/NameModal';
import ThemeToggle from '../components/ThemeToggle';
import { getStoredName, saveStoredName } from '../utils/nameStorage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [shouldShowNameModal, setShouldShowNameModal] = useState(false);
  const [showQuranReader, setShowQuranReader] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const storedName = getStoredName();
    const storedTheme = window.localStorage.getItem('athar:theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

    setTheme(storedTheme || preferredTheme);

    if (storedName) {
      setUserName(storedName);
    } else {
      setShouldShowNameModal(true);
    }
  }, []);

  const handleNameSave = (name) => {
    const savedName = saveStoredName(name);

    if (savedName) {
      setUserName(savedName);
      setShouldShowNameModal(false);
    }
  };

  const handleThemeToggle = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('athar:theme', nextTheme);
      return nextTheme;
    });
  };

  return (
    <main id="top" className="home-shell" dir="rtl" data-theme={theme}>
      <MainScene />
      <nav className="app-topbar" aria-label="أقسام تطبيق أثر">
        <a className="app-brand" href="#top" aria-label="أثر">
          <span className="brand-mark" aria-hidden="true">أث</span>
          <span>
            <strong>أثر</strong>
            <small>رفيقك اليومي</small>
          </span>
        </a>
        <div className="topbar-actions">
          <a href="#prayer-times">الصلاة</a>
          <a href="#qibla">القبلة</a>
          <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
        </div>
      </nav>
      <div className="content-stack">
        <Welcome userName={userName} />
        <AtharOfDay />
        <QuranTracker onOpenReader={() => setShowQuranReader(true)} />
        <PrayerTimes />
        <QiblaFinder />
        <Footer />
      </div>
      <nav className="bottom-dock" aria-label="تنقل سريع">
        <a href="#prayer-times">
          <span aria-hidden="true">◷</span>
          الصلاة
        </a>
        <button type="button" onClick={() => setShowQuranReader(true)}>
          <span aria-hidden="true">▤</span>
          القرآن
        </button>
        <a href="#qibla">
          <span aria-hidden="true">⌖</span>
          القبلة
        </a>
      </nav>
      {showQuranReader && <QuranReader onClose={() => setShowQuranReader(false)} />}
      {shouldShowNameModal && <NameModal onSave={handleNameSave} />}
    </main>
  );
}
