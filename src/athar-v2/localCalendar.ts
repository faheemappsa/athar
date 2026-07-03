export type AtharV2HijriDate = {
  day: number | null;
  month: number | null;
  year: number | null;
};

const parseArabicNumber = (value: string) => Number(value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))));

export function getLocalHijriDate(date = new Date()): AtharV2HijriDate {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

    return {
      day: parseArabicNumber(getPart("day")) || null,
      month: parseArabicNumber(getPart("month")) || null,
      year: parseArabicNumber(getPart("year")) || null,
    };
  } catch {
    return { day: null, month: null, year: null };
  }
}

export function getLocalHijriOccasionFlags(date = new Date()) {
  const hijri = getLocalHijriDate(date);
  return {
    hijri,
    isRamadan: hijri.month === 9,
    isArafah: hijri.month === 12 && hijri.day === 9,
    isWhiteDay: hijri.day === 13 || hijri.day === 14 || hijri.day === 15,
  };
}
