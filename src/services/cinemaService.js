// Cinema and showtime service
// Note: This uses mock data for demonstration. In production, you'd integrate with:
// - Fandango API, MovieGlu API, or Gracenote API for real showtime data
// - Google Places API for theater locations

// Mock cinema data for demonstration
const mockCinemas = [
  {
    id: 'cinema_1',
    name: 'AMC Empire 25',
    address: '234 W 42nd St, New York, NY 10036',
    distance: '0.5 miles',
    phone: '(212) 398-3939',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    showtimes: ['10:00 AM', '1:15 PM', '4:30 PM', '7:45 PM', '10:30 PM'],
    ticketUrl: 'https://www.fandango.com/amc-empire-25-AANYC',
    amenities: ['IMAX', 'Dolby Atmos', 'Reclining Seats', 'Concessions']
  },
  {
    id: 'cinema_2',
    name: 'Regal Union Square',
    address: '850 Broadway, New York, NY 10003',
    distance: '1.2 miles',
    phone: '(844) 462-7342',
    coordinates: { lat: 40.7359, lng: -73.9911 },
    showtimes: ['11:30 AM', '2:45 PM', '6:00 PM', '9:15 PM'],
    ticketUrl: 'https://www.fandango.com/regal-union-square-AANYK',
    amenities: ['4DX', 'RPX', 'Reclining Seats']
  },
  {
    id: 'cinema_3',
    name: 'Cinemark Century City',
    address: '10250 Santa Monica Blvd, Los Angeles, CA 90067',
    distance: '2.1 miles',
    phone: '(310) 553-8900',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    showtimes: ['12:00 PM', '3:20 PM', '6:40 PM', '10:00 PM'],
    ticketUrl: 'https://www.fandango.com/cinemark-century-city-AALAX',
    amenities: ['XD', 'Luxury Loungers', 'Reserved Seating']
  },
  {
    id: 'cinema_4',
    name: 'iPic Theaters',
    address: '1201 3rd Street Promenade, Santa Monica, CA 90401',
    distance: '3.5 miles',
    phone: '(310) 458-3924',
    coordinates: { lat: 34.0195, lng: -118.4912 },
    showtimes: ['1:00 PM', '4:15 PM', '7:30 PM', '10:45 PM'],
    ticketUrl: 'https://www.fandango.com/ipic-theaters-santa-monica-AASMC',
    amenities: ['Premium Dining', 'Full Bar', 'Luxury Seating']
  },
  {
    id: 'cinema_5',
    name: 'Alamo Drafthouse Cinema',
    address: '445 Albee Square W, Brooklyn, NY 11201',
    distance: '4.2 miles',
    phone: '(718) 513-2547',
    coordinates: { lat: 40.6892, lng: -73.9814 },
    showtimes: ['11:00 AM', '2:30 PM', '5:45 PM', '9:00 PM'],
    ticketUrl: 'https://www.fandango.com/alamo-drafthouse-cinema-brooklyn-AABKN',
    amenities: ['Dine-In Theater', 'Craft Beer', 'No Talking Policy']
  }
];

// Get user's current location
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get cinemas near user location
export const getCinemasNearLocation = async (userLocation, radiusMiles = 25) => {
  try {
    // In a real app, this would call a cinema API
    // For demo, we'll use mock data and calculate distances
    
    const cinemasWithDistance = mockCinemas.map(cinema => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        cinema.coordinates.lat,
        cinema.coordinates.lng
      );
      
      return {
        ...cinema,
        distance: `${distance.toFixed(1)} miles`,
        distanceValue: distance
      };
    });

    // Filter by radius and sort by distance
    const nearbyCinemas = cinemasWithDistance
      .filter(cinema => cinema.distanceValue <= radiusMiles)
      .sort((a, b) => a.distanceValue - b.distanceValue);

    return nearbyCinemas;
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    throw error;
  }
};

// Get showtimes for a specific movie at nearby cinemas
export const getMovieShowtimes = async (movieId, movieTitle, userLocation) => {
  try {
    const cinemas = await getCinemasNearLocation(userLocation);
    
    // In a real app, you'd filter cinemas that are actually showing this movie
    // For demo, we'll assume all cinemas are showing popular movies
    const cinemasShowingMovie = cinemas.map(cinema => ({
      ...cinema,
      // In reality, showtimes would be specific to the movie and date
      movieShowtimes: cinema.showtimes,
      bookingUrl: `${cinema.ticketUrl}?movie=${encodeURIComponent(movieTitle)}`
    }));

    return cinemasShowingMovie;
  } catch (error) {
    console.error('Error fetching movie showtimes:', error);
    throw error;
  }
};

// Format showtime for display
export const formatShowtime = (time) => {
  const [hours, minutes] = time.split(':');
  const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
  const displayHours = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
  return `${displayHours}:${minutes} ${period}`;
};

// Get directions URL (Google Maps)
export const getDirectionsUrl = (cinema, userLocation) => {
  const destination = encodeURIComponent(cinema.address);
  const origin = `${userLocation.latitude},${userLocation.longitude}`;
  return `https://www.google.com/maps/dir/${origin}/${destination}`;
};

export default {
  getUserLocation,
  getCinemasNearLocation,
  getMovieShowtimes,
  formatShowtime,
  getDirectionsUrl
};
