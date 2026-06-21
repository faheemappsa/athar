import { useState } from 'react';
import useSmartAthar from '../hooks/useSmartAthar';

export default function AtharOfDay({ prayers }) {
  const { athar, period, refreshAthar, sourceLabel, isFallback } = useSmartAthar(prayers);
  const [isChanging, setIsChanging] = useState(false);

  const handleRefresh = () => {
    setIsChanging(true);
    refreshAthar();
    window.setTimeout(() => setIsChanging(false), 220);
  };

  return (
    <article className={`glass-card athar-card ${isChanging ? 'athar-fade' : ''}`} data-period={period}>
      <div className="athar-card-topline">
        <div>
          <div className="card-label">{athar.title || 'أثر اليوم'}</div>
          <span className="athar-period-hint">{sourceLabel}</span>
        </div>
        {athar.type ? <span className="athar-type-label">{athar.type}</span> : null}
      </div>

      <blockquote className="athar-text">{athar.text}</blockquote>

      {athar.source || athar.benefit ? (
        <div className="athar-source">
          {athar.source ? <span>{athar.source}</span> : null}
          {athar.benefit ? <p>{athar.benefit}</p> : null}
        </div>
      ) : null}

      <button type="button" className="athar-refresh" onClick={handleRefresh}>
        أثر جديد
      </button>

      {isFallback ? <p className="hint">نعرض تذكيرًا عامًا حتى تتوفر محتويات أكثر.</p> : null}
    </article>
  );
}
