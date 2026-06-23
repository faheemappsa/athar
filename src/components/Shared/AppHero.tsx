type AppHeroProps = {
  title: string;
  subtitle?: string;
};

export default function AppHero({ title, subtitle }: AppHeroProps) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[34px] bg-action px-6 pb-14 pt-7 text-white shadow-xl">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-xs font-medium text-white/75">أثر</p>
          <h1 className="mt-2 text-3xl font-bold leading-snug">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-white/80">{subtitle}</p>}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl">✦</div>
      </div>
      <div className="absolute -bottom-8 left-0 h-20 w-2/3 rounded-tr-[90px] bg-primary-bg" />
      <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
    </section>
  );
}
