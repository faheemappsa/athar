import MainScene from '../components/MainScene';
import Welcome from '../components/Welcome';
import AtharOfDay from '../components/AtharOfDay';
import PrayerTimes from '../components/PrayerTimes';
import QiblaFinder from '../components/QiblaFinder';
import ShareButton from '../components/ShareButton';
import NameModal from '../components/NameModal';
import Footer from '../components/Footer';
import UIOverlay from '../components/UIOverlay';

export default function Home() {
  return (
    <>
      <MainScene />
      <Welcome />
      <AtharOfDay />
      <PrayerTimes />
      <QiblaFinder />
      <ShareButton />
      <NameModal />
      <Footer />
      <UIOverlay />
    </>
  );
}
