export const readLocalNumber = (key: string, fallback: number) => {
  try {
    return Number(window.localStorage.getItem(key) || fallback);
  } catch {
    return fallback;
  }
};
