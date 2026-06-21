import axios from 'axios';

const PRAYER_API_URL = 'https://api.aladhan.com/v1/timings';
const PRAYER_METHOD = 4;

function toUnixDate(date = new Date()) {
  return Math.floor(date.getTime() / 1000);
}

export async function getPrayerTimesByCoordinates({ latitude, longitude }, date = new Date()) {
  const response = await axios.get(`${PRAYER_API_URL}/${toUnixDate(date)}`, {
    params: {
      latitude,
      longitude,
      method: PRAYER_METHOD,
    },
  });

  const payload = response.data?.data;

  if (!payload?.timings) {
    throw new Error('لم تصل مواقيت الصلاة من مزود الخدمة.');
  }

  return {
    timings: payload.timings,
    location: payload.meta?.timezone || 'موقعك الحالي',
    date: payload.date?.readable || '',
  };
}
