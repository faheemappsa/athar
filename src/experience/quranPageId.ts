export const getQuranPageId = () => {
  try {
    const page = Number(window.localStorage.getItem("quran-page") || 1);
    return `quran-page-${page}`;
  } catch {
    return "quran-page-1";
  }
};
