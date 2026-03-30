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

// movies by cinema and date
export const getMovieByDate = async (cinemaId: string, date: string) => {
  const res = await api.get("/cinemas/movie-by-date", {
    params: { cinemaId, date },
  });

  return res.data.data ?? res.data.movies ?? res.data;
};

// show dates by cinema
export const getCinemaShowDates = async (cinemaId: string) => {
  const res = await api.get("/cinemas/show-dates", {
    params: { cinemaId },
  });

  return res.data.data ?? res.data.dates ?? res.data;
};

// offers
export const getOffers = async () => {
  const res = await api.get("/offers/list-offers");

  return res.data.data ?? res.data.offers ?? res.data;
};
