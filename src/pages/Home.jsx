import MainScene from '../components/MainScene';
import Welcome from '../components/Welcome';
import AtharOfDay from '../components/AtharOfDay';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import Footer from '../components/Footer';
import NameModal from '../components/NameModal';
import { getStoredName, saveStoredName } from '../utils/nameStorage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [shouldShowNameModal, setShouldShowNameModal] = useState(false);

  useEffect(() => {
    const storedName = getStoredName();

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

  return (
    <main className="home-shell" dir="rtl">
      <MainScene />
      <div className="content-stack">
        <Welcome userName={userName} />
        <AtharOfDay />
        <PrayerTimes />
        <QiblaFinder />
        <Footer />
      </div>
      {shouldShowNameModal && <NameModal onSave={handleNameSave} />}
    </main>
  );
}
