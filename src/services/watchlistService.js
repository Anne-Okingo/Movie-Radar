// Local storage keys
const WATCHLIST_KEY = 'movieradar_watchlist';
const WATCHED_KEY = 'movieradar_watched';

// Watchlist service using localStorage
export const watchlistService = {
  // Get all watchlist items
  getWatchlist: () => {
    try {
      const watchlist = localStorage.getItem(WATCHLIST_KEY);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  },

  // Add item to watchlist
  addToWatchlist: (item) => {
    try {
      const watchlist = watchlistService.getWatchlist();
      const exists = watchlist.find(w => w.id === item.id && w.type === item.type);
      
      if (!exists) {
        const newItem = {
          ...item,
          addedAt: new Date().toISOString(),
        };
        watchlist.push(newItem);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  },

  // Remove item from watchlist
  removeFromWatchlist: (id, type) => {
    try {
      const watchlist = watchlistService.getWatchlist();
      const filtered = watchlist.filter(item => !(item.id === id && item.type === type));
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  },

  // Check if item is in watchlist
  isInWatchlist: (id, type) => {
    try {
      const watchlist = watchlistService.getWatchlist();
      return watchlist.some(item => item.id === id && item.type === type);
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  },

  // Get watched items
  getWatched: () => {
    try {
      const watched = localStorage.getItem(WATCHED_KEY);
      return watched ? JSON.parse(watched) : [];
    } catch (error) {
      console.error('Error getting watched items:', error);
      return [];
    }
  },

  // Mark item as watched
  markAsWatched: (id, type) => {
    try {
      const watched = watchlistService.getWatched();
      const key = `${id}-${type}`;
      
      if (!watched.includes(key)) {
        watched.push(key);
        localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
      }
      return true;
    } catch (error) {
      console.error('Error marking as watched:', error);
      return false;
    }
  },

  // Mark item as unwatched
  markAsUnwatched: (id, type) => {
    try {
      const watched = watchlistService.getWatched();
      const key = `${id}-${type}`;
      const filtered = watched.filter(item => item !== key);
      localStorage.setItem(WATCHED_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error marking as unwatched:', error);
      return false;
    }
  },

  // Check if item is watched
  isWatched: (id, type) => {
    try {
      const watched = watchlistService.getWatched();
      const key = `${id}-${type}`;
      return watched.includes(key);
    } catch (error) {
      console.error('Error checking watched status:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(WATCHLIST_KEY);
      localStorage.removeItem(WATCHED_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },
};
