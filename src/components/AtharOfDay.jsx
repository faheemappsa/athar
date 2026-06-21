const ATHAR = [
  'اللهم أعنّي على ذكرك وشكرك وحسن عبادتك.',
  'من لزم الاستغفار جعل الله له من كل هم فرجًا.',
  'طمأنينة القلب تبدأ بخطوة صادقة نحو الله.',
];

export default function AtharOfDay() {
  const todayIndex = new Date().getDate() % ATHAR.length;

  return (
    <article className="glass-card athar-card">
      <div className="card-label">أثر اليوم</div>
      <blockquote>{ATHAR[todayIndex]}</blockquote>
      <p>اجعلها نية يومك، وشاركها مع من تحب لتبقى أثرًا طيبًا.</p>
    </article>
  );
}
