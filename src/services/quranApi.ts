import axios from "axios";

const BASE_URL = "https://api.alquran.cloud/v1";
const API_TIMEOUT_MS = 7000;

const quranClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
});

const unwrapQuranData = (response: { data?: { data?: unknown; status?: string } }) => {
  if (response.data?.status && response.data.status !== "OK") return null;
  return response.data?.data || null;
};

export const getRandomAyah = async () => {
  const response = await quranClient.get("/ayah/random/quran-uthmani");
  return unwrapQuranData(response);
};

export const getAyahByReference = async (reference: string) => {
  const response = await quranClient.get(`/ayah/${reference}/quran-uthmani`);
  return unwrapQuranData(response);
};

export const getQuranPage = async (pageNumber: number) => {
  const response = await quranClient.get(`/page/${pageNumber}/quran-uthmani`);
  return unwrapQuranData(response);
};
