export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isLight ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
      aria-pressed={!isLight}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">{isLight ? '☀' : '☾'}</span>
      </span>
      <span>{isLight ? 'نهاري' : 'ليلي'}</span>
    </button>
  );
}
