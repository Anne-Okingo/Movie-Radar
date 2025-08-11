import { useState, useEffect } from 'react';
import { TrendingUp, Film, Tv, Star } from 'lucide-react';
import { movieApi, formatMediaItem } from '../services/tmdbApi';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadContent();
  }, [activeTab, currentPage]);

  const loadContent = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (activeTab) {
        case 'trending':
          response = await movieApi.getTrending(currentPage);
          setTrending(response.data.results.map(formatMediaItem));
          break;
        case 'movies':
          response = await movieApi.getPopularMovies(currentPage);
          setPopularMovies(response.data.results.map(formatMediaItem));
          break;
        case 'tv':
          response = await movieApi.getPopularTVShows(currentPage);
          setPopularTVShows(response.data.results.map(formatMediaItem));
          break;
      }
      
      setTotalPages(Math.min(response.data.total_pages, 500)); // TMDB limits to 500 pages
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'trending':
        return trending;
      case 'movies':
        return popularMovies;
      case 'tv':
        return popularTVShows;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Discover Amazing Movies & TV Shows
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Explore trending content, build your watchlist, and never miss the latest releases
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('trending')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-primary-600 text-white'
                : 'text-dark-300 hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </button>
          
          <button
            onClick={() => handleTabChange('movies')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'movies'
                ? 'bg-primary-600 text-white'
                : 'text-dark-300 hover:text-white'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>Movies</span>
          </button>
          
          <button
            onClick={() => handleTabChange('tv')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'tv'
                ? 'bg-primary-600 text-white'
                : 'text-dark-300 hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" />
            <span>TV Shows</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
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
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {getCurrentContent().map((item) => (
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
      )}
    </div>
  );
};

export default Home;
