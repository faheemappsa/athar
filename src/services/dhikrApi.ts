import axios from "axios";

const BASE_URL = "https://dua-data-api.vercel.app/api";

export const getDailyDhikr = async () => {
  const response = await axios.get(`${BASE_URL}/dailyAdkar`);
  return response.data;
};

export const getMorningDhikr = async () => {
  const response = await axios.get(`${BASE_URL}/morningAdkar`);
  return response.data;
};

export const getEveningDhikr = async () => {
  const response = await axios.get(`${BASE_URL}/eveningAdkar`);
  return response.data;
};

export const getSleepDhikr = async () => {
  const response = await axios.get(`${BASE_URL}/sleepAdkar`);
  return response.data;
};
