"use client";

import { useState, useEffect } from "react";
import { Share2, Bookmark, RefreshCw, Loader2 } from "lucide-react";
import { fetchDailyAthar } from "@/lib/api";
import type { AtharItem } from "@/lib/api";

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadAthar = async () => {
    setLoading(true);
    const data = await fetchDailyAthar();
    setAthar(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAthar();
  }, []);

  const handleNewAthar = () => {
    setSaved(false);
    loadAthar();
  };

  const handleSave = () => {
    setSaved(!saved);
    if (!saved && athar) {
      const savedList = JSON.parse(localStorage.getItem("athar-saved") || "[]");
      savedList.push(athar);
      localStorage.setItem("athar-saved", JSON.stringify(savedList));
    }
  };

  const handleShare = () => {
    if (!athar) return;
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-athar-primary animate-spin" />
          </div>
        ) : athar ? (
          <>
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
          </>
        ) : null}
      </div>
    </section>
  );
}
