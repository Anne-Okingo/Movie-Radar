import { useState, useEffect } from 'react';
import { Bookmark, Eye, EyeOff, Trash2, Filter } from 'lucide-react';
import { watchlistService } from '../services/watchlistService';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState([]);
  const [filter, setFilter] = useState('all'); // all, watched, unwatched
  const [sortBy, setSortBy] = useState('added'); // added, title, year, rating

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [watchlist, filter, sortBy]);

  const loadWatchlist = () => {
    const items = watchlistService.getWatchlist();
    setWatchlist(items);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...watchlist];

    // Apply filter
    if (filter === 'watched') {
      filtered = filtered.filter(item => 
        watchlistService.isWatched(item.id, item.type)
      );
    } else if (filter === 'unwatched') {
      filtered = filtered.filter(item => 
        !watchlistService.isWatched(item.id, item.type)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'rating':
          return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'added':
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

    setFilteredWatchlist(filtered);
  };

  const handleWatchlistChange = () => {
    loadWatchlist();
  };

  const clearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      watchlistService.clearAll();
      loadWatchlist();
    }
  };

  const getWatchedCount = () => {
    return watchlist.filter(item => 
      watchlistService.isWatched(item.id, item.type)
    ).length;
  };

  const getUnwatchedCount = () => {
    return watchlist.length - getWatchedCount();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          My Watchlist
        </h1>
        <p className="text-dark-300 mb-6">
          Keep track of movies and TV shows you want to watch
        </p>

        {/* Stats */}
        {watchlist.length > 0 && (
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{watchlist.length}</div>
              <div className="text-dark-300 text-sm">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{getWatchedCount()}</div>
              <div className="text-dark-300 text-sm">Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{getUnwatchedCount()}</div>
              <div className="text-dark-300 text-sm">To Watch</div>
            </div>
          </div>
        )}
      </div>

      {watchlist.length > 0 ? (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-dark-400" />
                <span className="text-dark-300 font-medium">Filter:</span>
              </div>
              <div className="flex bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  All ({watchlist.length})
                </button>
                <button
                  onClick={() => setFilter('unwatched')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'unwatched'
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  To Watch ({getUnwatchedCount()})
                </button>
                <button
                  onClick={() => setFilter('watched')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === 'watched'
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Watched ({getWatchedCount()})
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-800 border border-dark-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="added">Recently Added</option>
                <option value="title">Title A-Z</option>
                <option value="year">Year (Newest)</option>
                <option value="rating">Rating (Highest)</option>
              </select>

              {/* Clear All */}
              <button
                onClick={clearWatchlist}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Watchlist Grid */}
          {filteredWatchlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredWatchlist.map((item) => (
                <MovieCard 
                  key={`${item.type}-${item.id}`} 
                  movie={item} 
                  onWatchlistChange={handleWatchlistChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {filter === 'watched' ? '✅' : filter === 'unwatched' ? '⏰' : '🔍'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'watched' 
                  ? 'No watched items' 
                  : filter === 'unwatched' 
                    ? 'Nothing to watch' 
                    : 'No items found'
                }
              </h3>
              <p className="text-dark-300">
                {filter === 'watched' 
                  ? 'Mark some items as watched to see them here' 
                  : filter === 'unwatched' 
                    ? 'All items in your watchlist have been watched!' 
                    : 'Try adjusting your filters'
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
          <p className="text-dark-300 mb-6">
            Start adding movies and TV shows you want to watch
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span>Discover Content</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
