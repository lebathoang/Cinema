import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// full movie
export async function getMovies() {
  try {
    const res = await api.get("/movies/list-movies");

    return res.data.data;

  } catch (error) {
    throw new Error("Failed to fetch movies");
  }
}

// Movie detail
export const getMovieDetail = async (id: string) => {
  try {
      const res = await api.get(`/movies/movie/${id}`);
  
      return res.data.data;
  
    } catch (error) {
      throw new Error("Failed to fetch movies");
    }
};

// search full
export const searchMovies = async (keyword: any) => {
  const res = await api.get("/movies/search", {
    params: { keyword },
  });
  return res.data;
};

// suggest autocomplete
export const suggestMovies = async (keyword: any) => {
  const res = await api.get("/movies/suggest", {
    params: { keyword },
  });
  return res.data;
};

// hot movie
export async function getRandomMovies() {
  const res = await api.get("/movies/random-movies?limit=10");
  return res.data.data;
}