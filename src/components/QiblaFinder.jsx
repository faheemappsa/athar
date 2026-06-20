import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGeolocation from '../hooks/useGeolocation';
import useQibla from '../hooks/useQibla';

export default function QiblaFinder() {
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const { qiblaAngle, error: qiblaError, loading: qiblaLoading } = useQibla(coords);
  const [active, setActive] = useState(false);

  const handleActivate = useCallback(() => {
    setActive(true);
    if (!coords && !geoLoading) requestLocation();
  }, [coords, geoLoading, requestLocation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="text-center px-6 mt-10 w-full select-none"
    >
      <div className="text-white/40 text-xs md:text-sm font-arabic tracking-widest uppercase mb-3">
        تحديد القبلة
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 backdrop-blur-md shadow-lg">
        {!active && (
          <button
            onClick={handleActivate}
            className="bg-white/10 hover:bg-white/20 text-white/80 font-arabic px-8 py-3 rounded-xl transition-all duration-300 text-sm"
          >
            🕋 اضغط لتحديد القبلة
          </button>
        )}

        {active && (geoLoading || qiblaLoading) && (
          <div className="text-white/40 text-sm font-arabic animate-pulse py-4">
            جاري تحديد القبلة...
          </div>
        )}

        {active && !geoLoading && geoError && (
          <div className="space-y-3 py-4">
            <div className="text-red-300/70 text-sm font-arabic">{geoError}</div>
            <button
              onClick={requestLocation}
              className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-arabic px-4 py-2 rounded-xl transition-all duration-300"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {active && !qiblaLoading && qiblaError && (
          <div className="text-red-300/70 text-sm font-arabic py-4">{qiblaError}</div>
        )}

        {active && qiblaAngle !== null && !qiblaError && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative w-28 h-28 rounded-full border-4 border-white/20 flex items-center justify-center">
              <div
                className="absolute w-1 h-12 bg-amber-400 rounded-full origin-bottom transition-transform duration-500 ease-out"
                style={{
                  transform: `rotate(${qiblaAngle}deg)`,
                  bottom: '50%',
                  transformOrigin: 'bottom center'
                }}
              />
              <div className="w-4 h-4 bg-amber-400 rounded-full z-10 shadow-lg shadow-amber-400/50" />
            </div>
            <div className="text-white/80 text-sm font-arabic mt-2">
              اتجاه القبلة: {qiblaAngle.toFixed(1)}°
            </div>
            <div className="text-white/30 text-xs font-arabic">
              وجّه هاتفك نحو الشمال
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
