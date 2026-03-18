import axios from "axios";

export const getMovieDetail = async (id: string) => {
  try {
      const res = await axios.get(
        `http://localhost:5000/api/movies/movie/${id}`
      );
  
      return res.data.data;
  
    } catch (error) {
      throw new Error("Failed to fetch movies");
    }
};