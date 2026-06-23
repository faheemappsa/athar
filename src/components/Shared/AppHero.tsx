type AppHeroProps = {
  title: string;
  subtitle?: string;
};

export default function AppHero({ title, subtitle }: AppHeroProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-[32px] bg-action px-6 pb-12 pt-7 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-xs font-medium text-white/75">أثر</p>
          <h1 className="mt-2 text-2xl font-bold leading-snug">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-white/80">{subtitle}</p>}
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white/20 text-lg">✦</div>
      </div>
    </section>
  );
}
