import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ExternalLink, 
  Navigation, 
  Star,
  Loader,
  AlertCircle,
  Ticket
} from 'lucide-react';
import { getMovieShowtimes, getUserLocation, getDirectionsUrl } from '../services/cinemaService';

const CinemaListings = ({ movieId, movieTitle, isVisible }) => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt'); // prompt, granted, denied

  useEffect(() => {
    if (isVisible && movieId && movieTitle) {
      loadCinemaListings();
    }
  }, [isVisible, movieId, movieTitle]);

  const loadCinemaListings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location first
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationPermission('granted');

      // Get cinemas showing this movie
      const movieCinemas = await getMovieShowtimes(movieId, movieTitle, location);
      setCinemas(movieCinemas);
    } catch (err) {
      console.error('Error loading cinema listings:', err);
      setError(err.message);
      if (err.message.includes('denied')) {
        setLocationPermission('denied');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setLocationPermission('prompt');
    loadCinemaListings();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Ticket className="h-5 w-5 text-blue-400" />
          <span>Showtimes Near You</span>
        </h3>
        
        {!loading && cinemas.length > 0 && (
          <button
            onClick={loadCinemaListings}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
          >
            <Navigation className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 text-blue-400 animate-spin mr-2" />
          <span className="text-gray-300">Finding theaters near you...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium mb-1">Unable to load theaters</h4>
              <p className="text-red-300 text-sm mb-3">{error}</p>
              
              {locationPermission === 'denied' && (
                <div className="text-sm text-gray-300 mb-3">
                  <p>To see theaters near you, please:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Click the location icon in your browser's address bar</li>
                    <li>Select "Allow" for location access</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
              
              <button
                onClick={handleRetryLocation}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && cinemas.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h4 className="text-gray-300 font-medium mb-2">No theaters found</h4>
          <p className="text-gray-400 text-sm">
            No theaters showing "{movieTitle}" were found in your area.
          </p>
        </div>
      )}

      {!loading && !error && cinemas.length > 0 && (
        <div className="space-y-4">
          {cinemas.map((cinema) => (
            <div key={cinema.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Theater Info */}
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{cinema.name}</h4>
                      <div className="flex items-center text-gray-300 text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{cinema.address}</span>
                        <span className="mx-2">•</span>
                        <span className="text-blue-400">{cinema.distance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {cinema.amenities && cinema.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cinema.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{cinema.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Showtimes & Actions */}
                <div className="lg:ml-6">
                  {/* Showtimes */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-300 text-sm font-medium">Today's Showtimes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cinema.movieShowtimes.map((time, index) => (
                        <button
                          key={index}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                          onClick={() => window.open(cinema.bookingUrl, '_blank')}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(cinema.bookingUrl, '_blank')}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Buy Tickets</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>

                    {userLocation && (
                      <button
                        onClick={() => window.open(getDirectionsUrl(cinema, userLocation), '_blank')}
                        className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Directions</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-gray-600">
            <p className="text-gray-400 text-sm">
              Showtimes updated daily. Prices and availability may vary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaListings;
