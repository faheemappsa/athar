const QURAN_PROGRESS_KEY = 'athar:quran-progress';

const FIRST_QURAN_PAGE = 1;
const LAST_QURAN_PAGE = 604;
const DEFAULT_TARGET_PAGES = 3;

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDefaultQuranProgress() {
  return {
    pageNumber: FIRST_QURAN_PAGE,
    pagesReadToday: 0,
    targetPages: DEFAULT_TARGET_PAGES,
    lastReadDate: getTodayDate(),
    completedToday: false,
  };
}

function normalizePageNumber(pageNumber) {
  const numericPage = Number(pageNumber);

  if (!Number.isFinite(numericPage)) {
    return FIRST_QURAN_PAGE;
  }

  return Math.min(Math.max(Math.round(numericPage), FIRST_QURAN_PAGE), LAST_QURAN_PAGE);
}

export function getQuranProgress() {
  if (typeof window === 'undefined') {
    return getDefaultQuranProgress();
  }

  try {
    const savedProgress = window.localStorage.getItem(QURAN_PROGRESS_KEY);

    if (!savedProgress) {
      return getDefaultQuranProgress();
    }

    const parsedProgress = JSON.parse(savedProgress);
    const today = getTodayDate();

    const progress = {
      ...getDefaultQuranProgress(),
      ...parsedProgress,
      pageNumber: normalizePageNumber(parsedProgress.pageNumber),
      targetPages: Number(parsedProgress.targetPages) || DEFAULT_TARGET_PAGES,
    };

    if (progress.lastReadDate !== today) {
      return {
        ...progress,
        pagesReadToday: 0,
        lastReadDate: today,
        completedToday: false,
      };
    }

    return {
      ...progress,
      completedToday: progress.pagesReadToday >= progress.targetPages,
    };
  } catch {
    return getDefaultQuranProgress();
  }
}

export function saveQuranProgress(progress) {
  const safeProgress = {
    ...getDefaultQuranProgress(),
    ...progress,
    pageNumber: normalizePageNumber(progress?.pageNumber),
    targetPages: Number(progress?.targetPages) || DEFAULT_TARGET_PAGES,
    lastReadDate: progress?.lastReadDate || getTodayDate(),
  };

  safeProgress.completedToday = safeProgress.pagesReadToday >= safeProgress.targetPages;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify(safeProgress));
  }

  return safeProgress;
}

export function markPageRead(pageNumber) {
  const progress = getQuranProgress();
  const today = getTodayDate();

  const updatedProgress = {
    ...progress,
    pageNumber: normalizePageNumber(pageNumber),
    pagesReadToday: progress.lastReadDate === today ? progress.pagesReadToday + 1 : 1,
    lastReadDate: today,
  };

  updatedProgress.completedToday = updatedProgress.pagesReadToday >= updatedProgress.targetPages;

  return saveQuranProgress(updatedProgress);
}
