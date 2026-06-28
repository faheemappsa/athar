import { ATHAR_SHORT_VERSES, ATHAR_TAFSIR_ID, QURAN_COM_API_BASE } from "./quranConfig";

export const fetchShortTafsir = async (seed: number) => {
  const verseKey = ATHAR_SHORT_VERSES[seed % ATHAR_SHORT_VERSES.length];
  const response = await fetch(`${QURAN_COM_API_BASE}/quran/tafsirs/${ATHAR_TAFSIR_ID}?verse_key=${verseKey}`);
  const data = await response.json();

  return {
    verseKey,
    text: data?.tafsirs?.[0]?.text || "",
  };
};
