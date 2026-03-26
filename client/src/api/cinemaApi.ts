import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// full cinemas
export async function getCinemas() {
  try {
    const res = await api.get("/cinemas/list-cinemas");

    return res.data.data;

  } catch (error) {
    throw new Error("Failed to fetch cinemas");
  }
}

// search full
export const searchCinemas = async (keyword: any) => {
  const res = await api.get("/cinemas/search", {
    params: { keyword },
  });
  return res.data;
};
