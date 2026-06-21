import { useCallback } from 'react';

export default function MainScene() {
  const handlePointerMove = useCallback((event) => {
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / innerHeight - 0.5).toFixed(3);
    document.documentElement.style.setProperty('--pointer-x', x);
    document.documentElement.style.setProperty('--pointer-y', y);
  }, []);

  return (
    <div className="main-scene" aria-hidden="true" onPointerMove={handlePointerMove}>
      {/* Deep cosmic vault */}
      <div className="sanctuary-vault" />

      {/* Celestial door – a subtle archway of light */}
      <div className="celestial-door" />

      {/* Sacred geometric rings – rendered with CSS */}
      <div className="geometry-field geometry-field-one" />
      <div className="geometry-field geometry-field-two" />

      {/* Kaaba stone – a glowing central point */}
      <div className="kaaba-stone" />

      {/* Dynamic light beams that shift with mouse */}
      <div className="light-beam light-beam-one" />
      <div className="light-beam light-beam-two" />

      {/* Horizon glow – a soft radial gradient at the bottom */}
      <div className="horizon-glow" />

      {/* Starfield – 40 stars with individual animations */}
      <div className="stars">
        {Array.from({ length: 40 }).map((_, index) => (
          <span key={index} style={{ '--i': index }} />
        ))}
      </div>

      {/* Drifting light particles – 30 particles with random delays */}
      <div className="light-particles">
        {Array.from({ length: 30 }).map((_, index) => (
          <span key={index} style={{ '--p': index }} />
        ))}
      </div>

      {/* Floor rings – concentric circles at the bottom */}
      <div className="floor-rings">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
