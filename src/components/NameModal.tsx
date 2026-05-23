"use client";

import { useState } from "react";
import { X, Heart, Save } from "lucide-react";

interface NameModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function NameModal({ isOpen, onSave, onClose }: NameModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <Heart className="w-10 h-10 text-athar-accent mx-auto" />
        <h3 className="text-lg font-bold text-athar-text dark:text-gray-200">وش نحب نناديك؟</h3>
        <p className="text-xs text-athar-muted dark:text-gray-400">
          اكتب اسمك أو لقبك عشان نعرفك
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك.. لقبك.. شي تحب نناديك فيه"
          className="w-full p-3 rounded-xl bg-athar-bg dark:bg-gray-800 text-athar-text dark:text-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-athar-accent/50 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          احفظ
        </button>
      </div>
    </div>
  );
}
