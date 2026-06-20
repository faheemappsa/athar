import { useState, useEffect, useCallback } from 'react';
import atharLibrary from '../data/atharLibrary.json';

const STORAGE_KEY = 'athar_history';
const MAX_HISTORY = 15;

function getHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToHistory(text) {
  const history = getHistory();
  const updated = [text, ...history.filter(item => item !== text)].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function pickRandomItem(library, history) {
  const available = library.filter(item => !history.includes(item.text));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return null;
}

export default function useAthar() {
  const [athar, setAthar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  const fetchFromApi = useCallback(async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/ayah/random');
      const data = await res.json();
      if (data && data.data) {
        const ayah = data.data;
        const item = {
          type: 'ayah',
          text: ayah.text,
          reference: `${ayah.surah.name} ${ayah.numberInSurah}`,
          page: null
        };
        setAthar(item);
        setFromApi(true);
      }
    } catch {
      setAthar(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAthar = useCallback(() => {
    setLoading(true);
    const history = getHistory();
    const picked = pickRandomItem(atharLibrary, history);

    if (picked) {
      addToHistory(picked.text);
      setAthar(picked);
      setFromApi(false);
      setLoading(false);
    } else {
      fetchFromApi();
    }
  }, [fetchFromApi]);

  useEffect(() => {
    refreshAthar();
  }, [refreshAthar]);

  return { athar, loading, fromApi, refreshAthar };
}
