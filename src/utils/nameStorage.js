const STORAGE_KEY = 'athar:userName';

const canUseLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export function getStoredName() {
  if (!canUseLocalStorage()) return '';

  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveStoredName(name) {
  if (!canUseLocalStorage()) return '';

  const safeName = String(name || '').trim();

  try {
    if (safeName) {
      window.localStorage.setItem(STORAGE_KEY, safeName);
    }
    return safeName;
  } catch {
    return '';
  }
}

export function clearStoredName() {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors to keep the app safe in restricted browsers.
  }
}
