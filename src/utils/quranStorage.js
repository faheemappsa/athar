const QURAN_PROGRESS_KEY = 'athar:quran-progress';

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getQuranProgress() {
  return null;
}

export function saveQuranProgress(progress) {
  return progress;
}

export function markPageRead(pageNumber) {
  return {
    pageNumber,
    readAt: getTodayDate(),
    storageKey: QURAN_PROGRESS_KEY,
  };
}
