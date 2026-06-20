import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NameModal({ onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem('athar_username', trimmed);
      window.dispatchEvent(new Event('athar_name_updated'));
    }
    onClose();
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#0c0c14] border border-white/10 rounded-2xl p-8 w-80 shadow-2xl text-center"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white/90 text-xl font-arabic mb-6">
          وش تحب نناديك؟
        </h3>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اسمك أو لقبك"
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-center font-arabic placeholder-white/30 outline-none focus:border-white/40 transition-colors duration-300"
          maxLength={20}
        />

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white/80 font-arabic py-2 rounded-xl transition-all duration-300"
        >
          حفظ
        </button>
      </motion.div>
    </motion.div>
  );
}
