export interface Movie {
  id: number,
  title: string,
  slug: string,
  description: string,
  duration: number,
  release_date: Date,
  language: string,
  poster_url: string,
  banner_url: string,
  trailer_url: string,
  age_rating: string,
  status: string
  genres: string[];
}

export const movies: any[] = [];
