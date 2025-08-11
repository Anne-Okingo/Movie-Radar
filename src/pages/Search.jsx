import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { movieApi, formatMediaItem } from '../services/tmdbApi';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query, 1);
    }
  }, [searchParams]);

  const performSearch = async (query, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await movieApi.search(query, page);
      let filteredResults = response.data.results.map(formatMediaItem);

      // Apply filter
      if (filterType !== 'all') {
        filteredResults = filteredResults.filter(item => item.type === filterType);
      }

      setResults(filteredResults);
      setTotalPages(Math.min(response.data.total_pages, 500));
      setTotalResults(response.data.total_results);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim(), 1);
    }
  };

  const handlePageChange = (page) => {
    const query = searchParams.get('q');
    if (query) {
      performSearch(query, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    const query = searchParams.get('q');
    if (query) {
      performSearch(query, 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Search Movies & TV Shows
        </h1>
        <p className="text-dark-300 mb-8">
          Discover your next favorite movie or TV show
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-dark-400" />
              <span className="text-dark-300 font-medium">Filter:</span>
            </div>
            <div className="flex bg-dark-800 rounded-lg p-1">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('movie')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterType === 'movie'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => handleFilterChange('tv')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterType === 'tv'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white'
                }`}
              >
                TV Shows
              </button>
            </div>
          </div>

          {totalResults > 0 && (
            <div className="text-dark-300">
              {totalResults.toLocaleString()} results found
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-dark-700 aspect-[2/3] rounded-xl mb-4"></div>
              <div className="bg-dark-700 h-4 rounded mb-2"></div>
              <div className="bg-dark-700 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map((item) => (
              <MovieCard key={`${item.type}-${item.id}`} movie={item} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        </>
      ) : searchParams.get('q') ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-dark-300">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Start your search</h3>
          <p className="text-dark-300">
            Enter a movie title, TV show, or actor name to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
