import type { Metadata } from "next";
import { Heart, BookOpen, DuaHands } from "lucide-react";

export const metadata: Metadata = {
  title: "عن الوقف — أثر",
  description: "وقف خيري عن مسلم عوده البويني رحمه الله",
};

export default function WaqfPage() {
  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold text-athar-primary">عن الوقف</h1>
        <p className="text-sm text-athar-muted mt-1">🕊️ وقف خيري</p>
      </header>

      {/* Waqf Card */}
      <section className="px-4 py-4">
        <div className="athar-card text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto bg-athar-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-athar-primary" />
          </div>

          {/* Name */}
          <div>
            <h2 className="text-xl font-bold text-athar-text">
              مسلم عوده البويني
            </h2>
            <p className="text-athar-muted mt-1">رحمه الله</p>
          </div>

          {/* Description */}
          <div className="bg-athar-bg rounded-xl p-4">
            <p className="text-athar-text leading-relaxed">
              هذا التطبيق وقف خيري عن مسلم عوده البويني رحمه الله.
              كل أثر تقرأه، كل مشاركة، كل تسبيحة... هي صدقة جارية له في قبره.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-athar-bg rounded-xl p-3">
              <BookOpen className="w-5 h-5 text-athar-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-athar-text">100+</p>
              <p className="text-xs text-athar-muted">أثر يومي</p>
            </div>
            <div className="bg-athar-bg rounded-xl p-3">
              <Heart className="w-5 h-5 text-athar-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-athar-text">∞</p>
              <p className="text-xs text-athar-muted">صدقة جارية</p>
            </div>
            <div className="bg-athar-bg rounded-xl p-3">
              <DuaHands className="w-5 h-5 text-athar-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-athar-text">لك</p>
              <p className="text-xs text-athar-muted">أجر المشاركة</p>
            </div>
          </div>

          {/* Dua Button */}
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <DuaHands className="w-5 h-5" />
            اللهم اجعل هذا الوقف نوراً له في قبره
          </button>

          {/* Quote */}
          <p className="text-sm text-athar-muted italic">
            "إذا مات ابن آدم انقطع عمله إلا من ثلاث: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له"
          </p>
        </div>
      </section>

      {/* Back Button */}
      <div className="px-4 py-4">
        <a href="/" className="btn-secondary w-full block text-center">
          العودة للرئيسية
        </a>
      </div>
    </main>
  );
}
