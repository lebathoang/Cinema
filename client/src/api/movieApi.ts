import axios from "axios";

export async function getMovies() {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/movies/list-movie"
    );

    return res.data.data;

  } catch (error) {
    throw new Error("Failed to fetch movies");
  }
}