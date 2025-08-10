# MovieRadar

A Movie/TV Show Discovery Web App

## Setup

### Backend (Go)
1. Install Go (https://golang.org/dl/)
2. Install dependencies (if any)
3. Run the server:
   ```bash
   cd backend
   go run main.go
   ```

### Frontend
- Static files are served from the `frontend/` directory by the Go backend.
- Open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure
- `backend/` - Go server, API proxy, caching
- `frontend/` - HTML, CSS, JS

## Next Steps
- Implement API proxy endpoints for TMDB/OMDB
- Add search, trending, and watchlist features 