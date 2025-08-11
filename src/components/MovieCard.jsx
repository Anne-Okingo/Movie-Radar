import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Play, Bookmark, BookmarkCheck, Eye, EyeOff } from 'lucide-react';
import { getImageUrl } from '../services/tmdbApi';
import { watchlistService } from '../services/watchlistService';

const MovieCard = ({ movie, onWatchlistChange }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(
    watchlistService.isInWatchlist(movie.id, movie.type)
  );
  const [isWatched, setIsWatched] = useState(
    watchlistService.isWatched(movie.id, movie.type)
  );

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWatchlist) {
      watchlistService.removeFromWatchlist(movie.id, movie.type);
      setIsInWatchlist(false);
    } else {
      watchlistService.addToWatchlist(movie);
      setIsInWatchlist(true);
    }

    if (onWatchlistChange) {
      onWatchlistChange();
    }
  };

  const handleWatchedToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWatched) {
      watchlistService.markAsUnwatched(movie.id, movie.type);
      setIsWatched(false);
    } else {
      watchlistService.markAsWatched(movie.id, movie.type);
      setIsWatched(true);
    }

    if (onWatchlistChange) {
      onWatchlistChange();
    }
  };

  const posterUrl = getImageUrl(movie.posterPath, 'w300');
  const year = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '');

  return (
    <div className="group relative bg-dark-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <Link to={`/${movie.type}/${movie.id}`}>
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-dark-700 flex items-center justify-center">
              <div className="text-dark-500 text-center">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-colors">
                <Play className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rating Badge */}
          {movie.voteAverage > 0 && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{movie.voteAverage.toFixed(1)}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <button
              onClick={handleWatchlistToggle}
              className={`p-1.5 rounded-full transition-colors ${
                isInWatchlist 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-primary-600'
              }`}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist ? (
                <BookmarkCheck className="h-3 w-3" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
            </button>

            <button
              onClick={handleWatchedToggle}
              className={`p-1.5 rounded-full transition-colors ${
                isWatched 
                  ? 'bg-green-600 text-white' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-green-600'
              }`}
              title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
            >
              {isWatched ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {movie.title}
          </h3>
          
          {year && (
            <div className="flex items-center text-dark-400 text-xs mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{year}</span>
            </div>
          )}

          {movie.overview && (
            <p className="text-dark-300 text-xs line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;
