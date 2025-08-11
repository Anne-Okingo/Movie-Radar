import { useState } from 'react';
import { MapPin, X, Info } from 'lucide-react';

const LocationPermissionBanner = ({ onLocationGranted, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleRequestLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      onLocationGranted(location);
      setIsVisible(false);
    } catch (error) {
      console.error('Location permission denied:', error);
      // Keep banner visible so user can try again
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-blue-400 font-medium mb-1">Find theaters near you</h4>
          <p className="text-blue-300 text-sm mb-3">
            Allow location access to see movie showtimes at nearby cinemas
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRequestLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Enable Location
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-300 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LocationPermissionBanner;
