import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Calendar, Clock, Play, Bookmark, BookmarkCheck,
  Eye, EyeOff, ArrowLeft, Users, Award, Globe, X, MapPin
} from 'lucide-react';
import { movieApi, getImageUrl, getVideoUrl } from '../services/tmdbApi';
import { watchlistService } from '../services/watchlistService';
import MovieCard from '../components/MovieCard';
import CinemaListings from '../components/CinemaListings';

const MovieDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showCinemas, setShowCinemas] = useState(false);

  const isMovie = window.location.pathname.includes('/movie/');
  const mediaType = isMovie ? 'movie' : 'tv';

  useEffect(() => {
    loadDetails();
  }, [id, mediaType]);

  useEffect(() => {
    if (details) {
      setIsInWatchlist(watchlistService.isInWatchlist(details.id, mediaType));
      setIsWatched(watchlistService.isWatched(details.id, mediaType));
    }
  }, [details, mediaType]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const response = isMovie 
        ? await movieApi.getMovieDetails(id)
        : await movieApi.getTVDetails(id);
      
      setDetails(response.data);

      // Format similar movies/TV shows
      const similarItems = response.data.similar?.results?.slice(0, 12) || [];

      const formattedSimilar = similarItems.map(item => ({
        id: item.id,
        type: mediaType,
        title: item.title || item.name,
        originalTitle: item.original_title || item.original_name,
        overview: item.overview,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        releaseDate: item.release_date || item.first_air_date,
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : item.first_air_date
            ? new Date(item.first_air_date).getFullYear()
            : null,
        voteAverage: item.vote_average,
        voteCount: item.vote_count,
        popularity: item.popularity,
        genreIds: item.genre_ids || [],
        adult: item.adult,
        originalLanguage: item.original_language,
      }));

      setSimilar(formattedSimilar);
      
      // Find trailer
      const videos = response.data.videos?.results || [];
      const trailer = videos.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || videos.find(video => video.site === 'YouTube');
      
      setTrailerKey(trailer?.key || null);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    const movieData = {
      id: details.id,
      type: mediaType,
      title: details.title || details.name,
      posterPath: details.poster_path,
      backdropPath: details.backdrop_path,
      overview: details.overview,
      releaseDate: details.release_date || details.first_air_date,
      voteAverage: details.vote_average,
      year: details.release_date 
        ? new Date(details.release_date).getFullYear()
        : details.first_air_date 
          ? new Date(details.first_air_date).getFullYear()
          : null,
    };

    if (isInWatchlist) {
      watchlistService.removeFromWatchlist(details.id, mediaType);
      setIsInWatchlist(false);
    } else {
      watchlistService.addToWatchlist(movieData);
      setIsInWatchlist(true);
    }
  };

  const handleWatchedToggle = () => {
    if (isWatched) {
      watchlistService.markAsUnwatched(details.id, mediaType);
      setIsWatched(false);
    } else {
      watchlistService.markAsWatched(details.id, mediaType);
      setIsWatched(true);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatGenres = (genres) => {
    return genres?.map(genre => genre.name).join(', ') || '';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-dark-700 rounded-xl mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-dark-700 rounded w-3/4"></div>
            <div className="h-4 bg-dark-700 rounded"></div>
            <div className="h-4 bg-dark-700 rounded w-5/6"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-dark-700 rounded w-1/2"></div>
            <div className="h-4 bg-dark-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">Content not found</h2>
        <p className="text-dark-300 mb-6">
          The movie or TV show you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const backdropUrl = getImageUrl(details.backdrop_path, 'w1280');
  const posterUrl = getImageUrl(details.poster_path, 'w500');
  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>
          </div>
        )}
        
        <div className="relative p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Poster */}
            <div className="lg:col-span-1">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={title}
                  className="w-full max-w-sm mx-auto lg:mx-0 rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-sm mx-auto lg:mx-0 aspect-[2/3] bg-dark-700 rounded-xl flex items-center justify-center">
                  <div className="text-dark-500 text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <div>No Image</div>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {title}
                </h1>
                {details.tagline && (
                  <p className="text-xl text-primary-400 italic mb-4">
                    "{details.tagline}"
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-dark-300">
                {year && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{year}</span>
                  </div>
                )}
                
                {details.runtime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatRuntime(details.runtime)}</span>
                  </div>
                )}
                
                {details.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{details.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {details.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-dark-700 text-dark-200 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {isMovie && (
                  <button
                    onClick={() => setShowCinemas(!showCinemas)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{showCinemas ? 'Hide Showtimes' : 'Find Showtimes'}</span>
                  </button>
                )}

                <button
                  onClick={handleWatchlistToggle}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isInWatchlist
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={handleWatchedToggle}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isWatched
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isWatched ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>{isWatched ? 'Watched' : 'Mark as Watched'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      {details.overview && (
        <div className="bg-dark-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <p className="text-dark-200 leading-relaxed">{details.overview}</p>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cast */}
        {details.credits?.cast?.length > 0 && (
          <div className="bg-dark-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Cast</span>
            </h3>
            <div className="space-y-2">
              {details.credits.cast.slice(0, 5).map((person) => (
                <div key={person.id} className="flex justify-between">
                  <span className="text-white">{person.name}</span>
                  <span className="text-dark-400">{person.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-dark-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Details</span>
          </h3>
          <div className="space-y-2">
            {details.original_language && (
              <div className="flex justify-between">
                <span className="text-dark-400">Language:</span>
                <span className="text-white">{details.original_language.toUpperCase()}</span>
              </div>
            )}
            {details.budget > 0 && (
              <div className="flex justify-between">
                <span className="text-dark-400">Budget:</span>
                <span className="text-white">${details.budget.toLocaleString()}</span>
              </div>
            )}
            {details.revenue > 0 && (
              <div className="flex justify-between">
                <span className="text-dark-400">Revenue:</span>
                <span className="text-white">${details.revenue.toLocaleString()}</span>
              </div>
            )}
            {details.status && (
              <div className="flex justify-between">
                <span className="text-dark-400">Status:</span>
                <span className="text-white">{details.status}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cinema Listings - Only for movies */}
      {isMovie && details && showCinemas && (
        <CinemaListings
          movieId={details.id}
          movieTitle={details.title}
          isVisible={showCinemas}
        />
      )}

      {/* Similar Content */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Similar {isMovie ? 'Movies' : 'TV Shows'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {similar.map((item) => (
              <MovieCard
                key={`similar-${item.id}`}
                movie={item}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-primary-400 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <iframe
              src={getVideoUrl(trailerKey)}
              title="Trailer"
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
