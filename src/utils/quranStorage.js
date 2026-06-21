const QURAN_PROGRESS_KEY = 'athar:quran-progress';

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getQuranProgress() {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedProgress = window.localStorage.getItem(QURAN_PROGRESS_KEY);

  if (!savedProgress) {
    return null;
  }

  try {
    return JSON.parse(savedProgress);
  } catch {
    return null;
  }
}

export function saveQuranProgress(progress) {
  if (typeof window === 'undefined') {
    return progress;
  }

  window.localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function markPageRead(pageNumber) {
  const progress = {
    pageNumber,
    lastReadAt: getTodayDate(),
  };

  return saveQuranProgress(progress);
}
