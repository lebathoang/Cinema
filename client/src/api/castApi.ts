import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
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
