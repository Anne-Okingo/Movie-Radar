#  MovieRadar

A modern, responsive movie and TV show discovery web application built with React and Tailwind CSS.

🔗 **Live demo:** [movie-radar-3wcw.onrender.com](https://movie-radar-3wcw.onrender.com)

##  Features

-  Search & Discovery: Search for movies and TV shows using TMDB API
-  Trending Content: View currently trending movies and TV shows
-  Personalized Experience: Browse popular movies and TV shows
-  Watchlist Management: Add movies/shows to your personal watchlist
-  Watch Tracking: Mark items as watched/unwatched
-  Detailed Information: View comprehensive details including ratings, cast, and similar content
-  Movie Previews: Watch trailers directly in the app
-  Responsive Design: Works perfectly on all devices
-  Fast Performance: Built with modern React and optimized for speed

##  Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Get a free API key from [TMDB](https://www.themoviedb.org/settings/api) and add it to a `.env` file:
```bash
cp .env.example .env
# then edit .env and set VITE_TMDB_API_KEY
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Built With

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons
- **TMDB API** - Movie and TV show data

##  Features Overview

### Home Page
- Trending movies and TV shows
- Popular movies and TV shows
- Tabbed navigation with pagination

### Search
- Real-time search functionality
- Filter by movies or TV shows
- Pagination for search results

### Movie/TV Details
- Comprehensive information display
- Watch trailers and previews
- Add to watchlist functionality
- Mark as watched/unwatched
- Similar content recommendations

### Watchlist
- Personal watchlist management
- Filter by watched/unwatched status
- Sort by different criteria

---

Made using React and Tailwind CSS

