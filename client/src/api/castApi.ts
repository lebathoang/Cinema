import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// cast by movie
export async function getMovieCast(id: string) {
  try {
    const res = await api.get(`/movies/${id}/cast`);

    return res.data.data;

  } catch (error) {
    throw new Error("Failed to fetch movies");
  }
}