import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'صباح الخير', icon: '🌅' };
  if (hour < 18) return { text: 'مساء النور', icon: '☀️' };
  return { text: 'مساء الخير', icon: '🌙' };
}

function getSpecialGreeting(name) {
  const day = new Date().getDay();
  const hour = new Date().getHours();
  if (day === 5) return `جمعة مباركة ${name} 🕌`;
  if (hour < 3 || hour > 22) return `أسأل الله أن يريح قلبك ${name} 🌙`;
  return null;
}

export default function Welcome({ onNameClick }) {
  const [name, setName] = useState(() => localStorage.getItem('athar_username') || '');
  const [greeting] = useState(getGreeting());

  useEffect(() => {
    const stored = localStorage.getItem('athar_username');
    if (stored && stored !== name) setName(stored);
  }, [name]);

  useEffect(() => {
    const handleNameUpdate = () => {
      const updated = localStorage.getItem('athar_username');
      if (updated) setName(updated);
    };
    window.addEventListener('athar_name_updated', handleNameUpdate);
    return () => window.removeEventListener('athar_name_updated', handleNameUpdate);
  }, []);

  const special = name ? getSpecialGreeting(name) : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={name + greeting.text}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center px-6 pt-10 select-none"
      >
        <div className="text-white/90 text-lg md:text-2xl font-arabic tracking-wide leading-relaxed">
          {special ? (
            <span>{special}</span>
          ) : (
            <span>
              {greeting.text} {name && `يا ${name}`} {greeting.icon}
            </span>
          )}
        </div>

        <div className="text-white/60 text-sm md:text-base mt-3 font-arabic">
          هلا بك في أثر
        </div>

        <button
          onClick={onNameClick}
          className="mt-4 text-white/50 text-xs underline underline-offset-4 hover:text-white/80 transition-colors duration-300 font-arabic"
        >
          {name ? 'تغيير الاسم' : 'وش تحب نناديك؟'}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
