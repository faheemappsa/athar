import axios from 'axios';

const PRAYER_API_URL = 'https://api.aladhan.com/v1/timings';
const PRAYER_METHOD = 4;
const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function toUnixDate(date = new Date()) {
  return Math.floor(date.getTime() / 1000);
}

function pickPrayerTimings(timings) {
  return PRAYER_KEYS.reduce((selectedTimings, key) => ({
    ...selectedTimings,
    [key]: timings[key],
  }), {});
}

export async function getPrayerTimesByCoordinates({ latitude, longitude }, date = new Date()) {
  const response = await axios.get(`${PRAYER_API_URL}/${toUnixDate(date)}`, {
    params: {
      latitude,
      longitude,
      method: PRAYER_METHOD,
    },
  });

  const timings = response.data?.data?.timings;

  if (!timings) {
    throw new Error('لم تصل مواقيت الصلاة من مزود الخدمة.');
  }

  return pickPrayerTimings(timings);
}
