import nebulaPoster from "@assets/generated_images/sci-fi_movie_poster_named_nebula.png";
import velocityPoster from "@assets/generated_images/action_movie_poster_named_velocity.png";
import whispersPoster from "@assets/generated_images/drama_movie_poster_named_whispers.png";

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  rating: string;
  duration: string;
  poster: string;
  description: string;
  backdrop: string; // Reusing poster as backdrop for now, blurred
  showtimes: string[];
  price: number;
}

export const movies: Movie[] = [
  {
    id: "1",
    title: "NEBULA",
    genre: ["Sci-Fi", "Adventure"],
    rating: "PG-13",
    duration: "2h 15m",
    poster: nebulaPoster,
    backdrop: nebulaPoster,
    description: "A lone astronaut must traverse a collapsing galaxy to find the source of a mysterious signal that could save humanity or destroy it.",
    showtimes: ["10:30 AM", "1:45 PM", "4:30 PM", "7:15 PM", "10:00 PM"],
    price: 14.99,
  },
  {
    id: "2",
    title: "VELOCITY",
    genre: ["Action", "Thriller"],
    rating: "R",
    duration: "1h 50m",
    poster: velocityPoster,
    backdrop: velocityPoster,
    description: "In a cyberpunk future where speed is currency, an underground racer gets caught in a deadly conspiracy involving the city's ruling elite.",
    showtimes: ["11:00 AM", "2:00 PM", "5:00 PM", "8:00 PM", "11:00 PM"],
    price: 15.99,
  },
  {
    id: "3",
    title: "WHISPERS",
    genre: ["Drama", "Mystery"],
    rating: "PG",
    duration: "2h 05m",
    poster: whispersPoster,
    backdrop: whispersPoster,
    description: "Secrets unravel in a small rainy town when a forgotten diary is discovered, revealing truths that change three families forever.",
    showtimes: ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"],
    price: 13.99,
  },
];
