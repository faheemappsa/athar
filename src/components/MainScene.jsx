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
      <div className="sanctuary-vault" />
      <div className="celestial-door" />
      <div className="kaaba-stone" />
      <div className="light-beam light-beam-one" />
      <div className="light-beam light-beam-two" />
      <div className="geometry-field geometry-field-one" />
      <div className="geometry-field geometry-field-two" />
      <div className="horizon-glow" />
      <div className="stars">
        {Array.from({ length: 34 }).map((_, index) => (
          <span key={index} style={{ '--i': index }} />
        ))}
      </div>
      <div className="light-particles">
        {Array.from({ length: 22 }).map((_, index) => (
          <span key={index} style={{ '--p': index }} />
        ))}
      </div>
      <div className="floor-rings">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
