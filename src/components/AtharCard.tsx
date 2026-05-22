"use client";

import { useState } from "react";
import { Share2, Bookmark, RefreshCw } from "lucide-react";

const atharData = [
  {
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "البقرة ٢٠١",
    category: "آية",
  },
  {
    text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
    source: "حديث صحيح",
    category: "دعاء",
  },
  {
    text: "إن الله مع الصابرين",
    source: "البقرة ١٥٣",
    category: "آية",
  },
];

export default function AtharCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const athar = atharData[currentIndex];

  const handleNewAthar = () => {
    setCurrentIndex((prev) => (prev + 1) % atharData.length);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(!saved);
    // TODO: Save to localStorage or Supabase
  };

  const handleShare = () => {
    // TODO: Generate card image
    if (navigator.share) {
      navigator.share({
        title: "أثر — كل يوم أثر نور",
        text: `${athar.text}\n— ${athar.source}`,
        url: window.location.href,
      });
    }
  };

  return (
    <section className="px-4 py-4">
      <div className="athar-card space-y-4">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-athar-muted bg-athar-bg px-3 py-1 rounded-full">
            {athar.category}
          </span>
          <span className="text-xs text-athar-muted">أثر اليوم</span>
        </div>

        {/* Athar Text */}
        <div className="text-center py-4">
          <p className="text-xl font-medium text-athar-text leading-relaxed">
            {athar.text}
          </p>
          <p className="text-sm text-athar-muted mt-3">— {athar.source}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className={`p-3 rounded-full transition-all ${
              saved ? "bg-athar-primary text-white" : "bg-athar-bg text-athar-primary"
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="btn-primary flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
          <button
            onClick={handleNewAthar}
            className="p-3 rounded-full bg-athar-bg text-athar-primary"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
