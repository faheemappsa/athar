import { useState } from 'react';
import MainScene from '../components/MainScene';
import UIOverlay from '../components/UIOverlay';
import Welcome from '../components/Welcome';
import AtharOfDay from '../components/AtharOfDay';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import Footer from '../components/Footer';
import NameModal from '../components/NameModal';

export default function Home() {
  const [showNameModal, setShowNameModal] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <MainScene />
      <UIOverlay>
        <Welcome onNameClick={() => setShowNameModal(true)} />
        <AtharOfDay />
        <PrayerTimes />
        <QiblaFinder />
        <Footer />
      </UIOverlay>
      {showNameModal && <NameModal onClose={() => setShowNameModal(false)} />}
    </div>
  );
}
