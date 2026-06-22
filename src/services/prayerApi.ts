import axios from "axios";

const BASE_URL = "https://api.aladhan.com/v1";

export const getPrayerTimes = async (latitude: number, longitude: number) => {
  const date = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const response = await axios.get(
    `${BASE_URL}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=4`
  );
  return response.data.data.timings;
};
