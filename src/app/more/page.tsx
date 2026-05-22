"use client";

import { useState } from "react";
import { Heart, Share2, MessageCircle, Info, Trash2, Check } from "lucide-react";
import { WHATSAPP_LINK, APP_VERSION, WAQF_NAME, WAQF_DESCRIPTION } from "@/lib/constants";
import { trackSupportClick } from "@/lib/analytics";
import BottomNav from "@/components/BottomNav";

export default function MorePage() {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSupport = () => {
    trackSupportClick();
    window.open(WHATSAPP_LINK, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "أثر — كل يوم أثر نور",
        text: "تطبيق أثر، كل يوم أثر نور. وقف خيري عن مسلم عوده البويني رحمه الله",
        url: window.location.origin,
      });
    }
  };

  const handleResetStreak = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    localStorage.removeItem("athar-streak");
    localStorage.removeItem("athar-last-visit");
    setResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Info className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">المزيد</h1>
        </div>
      </header>

      <section className="px-4 py-2 space-y-4">
        {/* بطاقة الوقف */}
        <div className="athar-card text-center space-y-3">
          <Heart className="w-8 h-8 text-athar-accent mx-auto" />
          <div>
            <p className="text-sm font-medium text-athar-text">{WAQF_NAME}</p>
            <p className="text-xs text-athar-muted mt-1 leading-relaxed">{WAQF_DESCRIPTION}</p>
          </div>
          <button
            onClick={handleSupport}
            className="btn-primary flex items-center gap-2 mx-auto text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            تواصل معنا
          </button>
        </div>

        {/* مشاركة التطبيق */}
        <button
          onClick={handleShare}
          className="athar-card flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-athar-primary" />
            <span className="text-sm font-medium text-athar-text">مشاركة التطبيق</span>
          </div>
          <span className="text-xs text-athar-muted">انشر الخير</span>
        </button>

        {/* إعادة ضبط السلسلة */}
        <div className="athar-card space-y-3">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-athar-text">إعادة ضبط السلسلة</span>
          </div>
          <p className="text-xs text-athar-muted">
            سيتم حذف تقدم سلسلة النور من جهازك فقط
          </p>
          {resetDone ? (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" />
              تمت إعادة الضبط
            </span>
          ) : (
            <button
              onClick={handleResetStreak}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                resetConfirm
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {resetConfirm ? "تأكيد إعادة الضبط" : "إعادة الضبط"}
            </button>
          )}
        </div>

        {/* رقم الإصدار */}
        <p className="text-center text-xs text-athar-muted pt-4">
          نسخة {APP_VERSION}
        </p>
      </section>

      <BottomNav />
    </main>
  );
}
