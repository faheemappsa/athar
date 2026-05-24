"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

interface DhikrPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  phrases: string[];
  target: number;
}

export default function DhikrPopup({ isOpen, onClose, onComplete, phrases, target }: DhikrPopupProps) {
  const [count, setCount] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCount(0);
      setCurrentPhraseIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTap = () => {
    if (count >= target) return;

    const newCount = count + 1;
    setCount(newCount);

    // تغيير العبارة مع كل ضغطة
    const newPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
    setCurrentPhraseIndex(newPhraseIndex);

    if (newCount >= target) {
      onComplete();
    }
  };

  const progress = (count / target) * 100;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h3 className="text-xl font-bold text-athar-text dark:text-gray-200 pt-2">
          {count === 0 ? "اضغط للتسبيح" : `${count} من ${target}`}
        </h3>

        {/* شريط التقدم */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-athar-primary-400 to-athar-accent-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* العبارة الحالية */}
        <button
          onClick={handleTap}
          className="w-full min-h-[100px] p-6 rounded-2xl bg-gradient-to-br from-athar-accent-100 to-athar-primary-50 dark:from-athar-accent-900/30 dark:to-athar-primary-900/30 border border-athar-accent-200/30 dark:border-athar-accent-700/30 flex items-center justify-center transition-all active:scale-95 hover:shadow-md"
        >
          <span className="text-2xl font-medium text-athar-text dark:text-gray-200 leading-relaxed">
            {phrases[currentPhraseIndex]}
          </span>
        </button>

        {/* رسالة الإكمال */}
        {count >= target && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-athar-accent-500">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">أحسنت! نمت ورقة جديدة في شجرتك 🍃</span>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              الحمد لله
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
