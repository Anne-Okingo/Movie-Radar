import axios from 'axios';

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Free API key for demo
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Helper function to get image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Helper function to get video URL (YouTube)
export const getVideoUrl = (key) => {
  return `https://www.youtube.com/embed/${key}`;
};

// API functions
export const movieApi = {
  // Get trending movies
  getTrending: (page = 1) => 
    tmdbApi.get('/trending/all/week', { params: { page } }),

  // Search movies and TV shows
  search: (query, page = 1) => 
    tmdbApi.get('/search/multi', { params: { query, page } }),

  // Get popular movies
  getPopularMovies: (page = 1) => 
    tmdbApi.get('/movie/popular', { params: { page } }),

  // Get popular TV shows
  getPopularTVShows: (page = 1) => 
    tmdbApi.get('/tv/popular', { params: { page } }),

  // Get movie details
  getMovieDetails: (id) => 
    tmdbApi.get(`/movie/${id}`, { 
      params: { 
        append_to_response: 'videos,credits,similar,reviews' 
      } 
    }),

  // Get TV show details
  getTVDetails: (id) => 
    tmdbApi.get(`/tv/${id}`, { 
      params: { 
        append_to_response: 'videos,credits,similar,reviews' 
      } 
    }),

  // Get movie genres
  getMovieGenres: () => 
    tmdbApi.get('/genre/movie/list'),

  // Get TV genres
  getTVGenres: () => 
    tmdbApi.get('/genre/tv/list'),

  // Discover movies by genre
  discoverMovies: (genreId, page = 1) => 
    tmdbApi.get('/discover/movie', { 
      params: { 
        with_genres: genreId, 
        page,
        sort_by: 'popularity.desc'
      } 
    }),

  // Discover TV shows by genre
  discoverTVShows: (genreId, page = 1) => 
    tmdbApi.get('/discover/tv', { 
      params: { 
        with_genres: genreId, 
        page,
        sort_by: 'popularity.desc'
      } 
    }),

  // Get now playing movies
  getNowPlaying: (page = 1) => 
    tmdbApi.get('/movie/now_playing', { params: { page } }),

  // Get upcoming movies
  getUpcoming: (page = 1) => 
    tmdbApi.get('/movie/upcoming', { params: { page } }),

  // Get top rated movies
  getTopRated: (page = 1) => 
    tmdbApi.get('/movie/top_rated', { params: { page } }),
};

// Format movie/TV data consistently
export const formatMediaItem = (item) => {
  const isMovie = item.media_type === 'movie' || item.title;
  return {
    id: item.id,
    type: isMovie ? 'movie' : 'tv',
    title: item.title || item.name,
    originalTitle: item.original_title || item.original_name,
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.release_date || item.first_air_date,
    year: item.release_date ? new Date(item.release_date).getFullYear() : 
          item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    popularity: item.popularity,
    genreIds: item.genre_ids || [],
    adult: item.adult,
    originalLanguage: item.original_language,
  };
};

export default tmdbApi;
