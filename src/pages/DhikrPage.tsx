import Dhikr from "../components/Dhikr/Dhikr";
import Footer from "../components/Footer/Footer";

export default function DhikrPage() {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-center text-primary-text">الأذكار</h2>
      <Dhikr />
      <Footer />
    </div>
  );
}
