export const adminEventLabels: Record<string, string> = {
  athar_content_view: "قراءة محتوى",
  page_view: "فتح صفحة",
  athar_brain_decision: "قرار الذكاء",
  nav_home: "فتح الرئيسية",
  nav_dhikr: "فتح الأذكار",
  nav_quran: "فتح المصحف",
  nav_radio: "فتح الإذاعة",
  athar_share_start: "بدأ مشاركة",
  athar_share_error: "فشل مشاركة",
  athar_share_success: "مشاركة ناجحة",
};

export const localizeAdminRows = (rows: { name: string; value: number }[] = []) =>
  rows.map((row) => ({ ...row, name: adminEventLabels[row.name] || row.name }));

export const localizeAdminLabel = (name: string) => adminEventLabels[name] || name;
