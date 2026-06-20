import axios from 'axios';

const API_BASE = 'https://api.aladhan.com/v1';

export async function getPrayerTimes(latitude, longitude, date) {
  const day = date || new Date();
  const timestamp = Math.floor(day.getTime() / 1000);

  const res = await axios.get(`${API_BASE}/timings/${timestamp}`, {
    params: {
      latitude,
      longitude,
      method: 4,
      school: 0,
      midnightMode: 0,
      tune: '0,0,0,0,0,0,0,0,0'
    }
  });

  const data = res.data.data;

  return {
    timings: data.timings,
    date: {
      hijri: data.date.hijri,
      gregorian: data.date.gregorian
    }
  };
}
