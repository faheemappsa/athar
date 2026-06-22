import Dhikr from "../components/Dhikr/Dhikr";
import Footer from "../components/Footer/Footer";

export default function DhikrPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-[#1A3B5C]">الأذكار</h2>
      <Dhikr />
      <Footer />
    </div>
  );
}
