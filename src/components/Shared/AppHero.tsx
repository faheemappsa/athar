type AppHeroProps = {
  title: string;
  subtitle?: string;
};

export default function AppHero({ title, subtitle }: AppHeroProps) {
  const isLongTitle = title.length >= 6;

  return (
    <section className="relative mb-6 min-h-[220px] overflow-hidden rounded-[38px] bg-gradient-to-br from-[#2F9D75] via-[#39AA80] to-[#67B99D] px-7 pb-20 pt-10 text-white shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.14),transparent_20%)]" />
      <div className="relative z-20 flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[20px] bg-white/18 text-2xl shadow-inner backdrop-blur-sm">✦</div>
        <div className="max-w-[72%] text-right">
          <h1 className={`${isLongTitle ? "text-[2.55rem]" : "text-4xl"} font-bold leading-snug`}>{title}</h1>
          {subtitle && <p className="mt-3 max-w-[280px] text-base leading-relaxed text-white/82">{subtitle}</p>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-[92px] overflow-hidden">
        <svg viewBox="0 0 420 120" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 66 C58 18 130 56 188 70 C258 88 296 34 420 28 L420 120 L0 120 Z"
            fill="#EAF6F3"
            opacity="0.92"
          />
          <path
            d="M0 78 C66 28 136 66 194 82 C258 102 318 42 420 36 L420 120 L0 120 Z"
            fill="#F8FFFD"
            opacity="0.76"
          />
        </svg>
      </div>

      <div className="absolute right-8 bottom-14 z-20 h-3 w-28 rotate-[-8deg] rounded-full bg-white/18" />
      <div className="absolute right-20 bottom-20 z-20 h-2 w-2 rounded-full bg-white/60" />
      <div className="absolute right-32 bottom-16 z-20 h-1.5 w-1.5 rounded-full bg-white/45" />
      <div className="absolute left-6 top-7 grid h-11 w-11 place-items-center rounded-2xl bg-white/16 backdrop-blur-sm">
        <span className="grid grid-cols-2 gap-1">
          <i className="h-1.5 w-1.5 rounded-full bg-white/80" />
          <i className="h-1.5 w-1.5 rounded-full bg-white/80" />
          <i className="h-1.5 w-1.5 rounded-full bg-white/80" />
          <i className="h-1.5 w-1.5 rounded-full bg-white/80" />
        </span>
      </div>
    </section>
  );
}
