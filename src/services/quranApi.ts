import axios from "axios";

const BASE_URL = "https://api.alquran.cloud/v1";

export const getRandomAyah = async () => {
  const response = await axios.get(`${BASE_URL}/ayah/random/quran-uthmani`);
  return response.data.data;
};

export const getAyahByReference = async (reference: string) => {
  const response = await axios.get(`${BASE_URL}/ayah/${reference}/quran-uthmani`);
  return response.data.data;
};

export const getQuranPage = async (pageNumber: number) => {
  const response = await axios.get(`${BASE_URL}/page/${pageNumber}/quran-uthmani`);
  return response.data.data;
};
