import { useState } from 'react';
import useSmartAthar from '../hooks/useSmartAthar';

export default function AtharOfDay({ prayers }) {
  const { athar, period, refreshAthar, sourceLabel, isFallback } = useSmartAthar(prayers);
  const [isChanging, setIsChanging] = useState(false);

  const handleRefresh = () => {
    setIsChanging(true);
    refreshAthar();
    window.setTimeout(() => setIsChanging(false), 300);
  };

  return (
    <article className={`glass-card athar-card ${isChanging ? 'athar-fade' : ''}`} data-period={period}>
      <div className="athar-glow" aria-hidden="true" />

      <div className="athar-content">
        <span className="athar-quote-open">﴿</span>
        <blockquote className="athar-text">{athar.text}</blockquote>
        <span className="athar-quote-close">﴾</span>

        <div className="athar-footer">
          <span className="athar-source">{athar.source || sourceLabel}</span>
          {athar.benefit && <span className="athar-benefit">— {athar.benefit}</span>}
        </div>
      </div>

      <button type="button" className="athar-refresh" onClick={handleRefresh}>
        <span>تجديد</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>

      {isFallback && <p className="hint">نعرض تذكيرًا عامًا حتى تتوفر محتويات أكثر.</p>}
    </article>
  );
}
