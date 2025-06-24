package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "watchlist.db")
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS watchlist (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		tmdb_id TEXT,
		type TEXT,
		title TEXT,
		poster_path TEXT,
		year TEXT,
		watched INTEGER
	)`)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}
}

type WatchlistItem struct {
	TMDBID     string `json:"tmdb_id"`
	Type       string `json:"type"`
	Title      string `json:"title"`
	PosterPath string `json:"poster_path"`
	Year       string `json:"year"`
	Watched    bool   `json:"watched"`
}

func getEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Environment variable %s not set", key)
	}
	return val
}

type TMDBSearchResult struct {
	Page         int               `json:"page"`
	Results      []json.RawMessage `json:"results"`
	TotalResults int               `json:"total_results"`
	TotalPages   int               `json:"total_pages"`
}

type SearchResponse struct {
	Results      []json.RawMessage `json:"results"`
	TotalResults int               `json:"total_results"`
	Page         int               `json:"page"`
	TotalPages   int               `json:"total_pages"`
}

var trendingCache struct {
	Data      []byte
	ExpiresAt time.Time
}

var genresCache struct {
	Data      []byte
	ExpiresAt time.Time
}

var recommendCache = map[string]struct {
	Data      []byte
	ExpiresAt time.Time
}{}

// Helper to handle TMDB/OMDB errors and rate limits
func handleAPIError(w http.ResponseWriter, resp *http.Response, service string) bool {
	if resp == nil {
		http.Error(w, "No response from "+service, http.StatusBadGateway)
		return true
	}
	if resp.StatusCode == 429 {
		http.Error(w, service+" rate limit exceeded", http.StatusTooManyRequests)
		return true
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		http.Error(w, service+" API error", http.StatusBadGateway)
		return true
	}
	return false
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	if query == "" {
		http.Error(w, "Missing search query", http.StatusBadRequest)
		return
	}

	tmdbKey := getEnv("TMDB_API_KEY")
	// omdbKey := getEnv("OMDB_API_KEY") // For future use

	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/search/multi?api_key=%s&query=%s&page=%s", url.QueryEscape(tmdbKey), url.QueryEscape(query), url.QueryEscape(page))

	client := &http.Client{Timeout: 10 * time.Second}
	tmdbResp, err := client.Get(tmdbURL)
	if err != nil {
		http.Error(w, "Failed to fetch from TMDB", http.StatusBadGateway)
		return
	}
	defer tmdbResp.Body.Close()
	if handleAPIError(w, tmdbResp, "TMDB") {
		return
	}

	var tmdbResult TMDBSearchResult
	err = json.NewDecoder(tmdbResp.Body).Decode(&tmdbResult)
	if err != nil || tmdbResult.Results == nil {
		http.Error(w, "Failed to parse TMDB response", http.StatusInternalServerError)
		return
	}

	// TODO: For each result, fetch OMDB data and merge (stub for now)
	// For now, just return TMDB results
	resp := SearchResponse{
		Results:      tmdbResult.Results,
		TotalResults: tmdbResult.TotalResults,
		Page:         tmdbResult.Page,
		TotalPages:   tmdbResult.TotalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func trendingHandler(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	if trendingCache.Data != nil && trendingCache.ExpiresAt.After(now) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(trendingCache.Data)
		return
	}

	tmdbKey := getEnv("TMDB_API_KEY")
	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/trending/all/week?api_key=%s&page=%s", url.QueryEscape(tmdbKey), url.QueryEscape(page))
	client := &http.Client{Timeout: 10 * time.Second}
	tmdbResp, err := client.Get(tmdbURL)
	if err != nil {
		http.Error(w, "Failed to fetch trending from TMDB", http.StatusBadGateway)
		return
	}
	defer tmdbResp.Body.Close()
	if handleAPIError(w, tmdbResp, "TMDB") {
		return
	}
	data, err := io.ReadAll(tmdbResp.Body)
	if err != nil {
		http.Error(w, "Failed to read TMDB response", http.StatusInternalServerError)
		return
	}
	trendingCache.Data = data
	trendingCache.ExpiresAt = now.Add(10 * time.Minute)
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func detailsHandler(w http.ResponseWriter, r *http.Request) {
	tmdbID := r.URL.Query().Get("id")
	typeParam := r.URL.Query().Get("type") // movie or tv
	if tmdbID == "" || (typeParam != "movie" && typeParam != "tv") {
		http.Error(w, "Missing or invalid id/type", http.StatusBadRequest)
		return
	}

	tmdbKey := getEnv("TMDB_API_KEY")
	omdbKey := getEnv("OMDB_API_KEY")

	// Fetch TMDB details
	tmdbURL := fmt.Sprintf("https://api.themoviedb.org/3/%s/%s?api_key=%s", typeParam, url.QueryEscape(tmdbID), url.QueryEscape(tmdbKey))
	client := &http.Client{Timeout: 10 * time.Second}
	tmdbResp, err := client.Get(tmdbURL)
	if err != nil {
		http.Error(w, "Failed to fetch details from TMDB", http.StatusBadGateway)
		return
	}
	defer tmdbResp.Body.Close()
	if handleAPIError(w, tmdbResp, "TMDB") {
		return
	}
	var tmdbData map[string]interface{}
	err = json.NewDecoder(tmdbResp.Body).Decode(&tmdbData)
	if err != nil || tmdbData == nil {
		http.Error(w, "Failed to parse TMDB details", http.StatusInternalServerError)
		return
	}

	// Try to get IMDB id from TMDB data
	imdbID := ""
	if val, ok := tmdbData["imdb_id"].(string); ok && val != "" {
		imdbID = val
	}
	// If not present, fetch external_ids
	if imdbID == "" {
		extURL := fmt.Sprintf("https://api.themoviedb.org/3/%s/%s/external_ids?api_key=%s", typeParam, url.QueryEscape(tmdbID), url.QueryEscape(tmdbKey))
		extResp, err := client.Get(extURL)
		if err == nil {
			defer extResp.Body.Close()
			if handleAPIError(w, extResp, "TMDB") {
				return
			}
			var extData map[string]interface{}
			json.NewDecoder(extResp.Body).Decode(&extData)
			if val, ok := extData["imdb_id"].(string); ok && val != "" {
				imdbID = val
			}
		}
	}

	// Fetch OMDB details if imdbID is available
	var omdbData map[string]interface{}
	if imdbID != "" && omdbKey != "" {
		omdbURL := fmt.Sprintf("https://www.omdbapi.com/?i=%s&apikey=%s", url.QueryEscape(imdbID), url.QueryEscape(omdbKey))
		omdbResp, err := client.Get(omdbURL)
		if err == nil {
			defer omdbResp.Body.Close()
			if handleAPIError(w, omdbResp, "OMDB") {
				return
			}
			json.NewDecoder(omdbResp.Body).Decode(&omdbData)
		}
	}

	// Merge ratings/plot from OMDB into TMDB data
	if omdbData != nil {
		if plot, ok := omdbData["Plot"].(string); ok && plot != "N/A" {
			tmdbData["omdb_plot"] = plot
		}
		if ratings, ok := omdbData["Ratings"].([]interface{}); ok {
			tmdbData["omdb_ratings"] = ratings
		}
		if rt, ok := omdbData["imdbRating"].(string); ok && rt != "N/A" {
			tmdbData["imdb_rating"] = rt
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tmdbData)
}

func genresHandler(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	if genresCache.Data != nil && genresCache.ExpiresAt.After(now) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(genresCache.Data)
		return
	}

	tmdbKey := getEnv("TMDB_API_KEY")
	client := &http.Client{Timeout: 10 * time.Second}

	movieURL := fmt.Sprintf("https://api.themoviedb.org/3/genre/movie/list?api_key=%s", url.QueryEscape(tmdbKey))
	tvURL := fmt.Sprintf("https://api.themoviedb.org/3/genre/tv/list?api_key=%s", url.QueryEscape(tmdbKey))

	movieResp, err := client.Get(movieURL)
	if err != nil {
		http.Error(w, "Failed to fetch movie genres from TMDB", http.StatusBadGateway)
		return
	}
	defer movieResp.Body.Close()
	if handleAPIError(w, movieResp, "TMDB") {
		return
	}
	var movieData map[string]interface{}
	json.NewDecoder(movieResp.Body).Decode(&movieData)

	tvResp, err := client.Get(tvURL)
	if err != nil {
		http.Error(w, "Failed to fetch TV genres from TMDB", http.StatusBadGateway)
		return
	}
	defer tvResp.Body.Close()
	if handleAPIError(w, tvResp, "TMDB") {
		return
	}
	var tvData map[string]interface{}
	json.NewDecoder(tvResp.Body).Decode(&tvData)

	// Merge genres
	genreMap := map[int]map[string]interface{}{}
	mg, ok1 := movieData["genres"].([]interface{})
	tg, ok2 := tvData["genres"].([]interface{})
	if !ok1 && !ok2 {
		http.Error(w, "No genres found", http.StatusInternalServerError)
		return
	}
	if ok1 {
		for _, g := range mg {
			genre := g.(map[string]interface{})
			id := int(genre["id"].(float64))
			genreMap[id] = genre
		}
	}
	if ok2 {
		for _, g := range tg {
			genre := g.(map[string]interface{})
			id := int(genre["id"].(float64))
			genreMap[id] = genre
		}
	}
	genres := []map[string]interface{}{}
	for _, g := range genreMap {
		genres = append(genres, g)
	}

	resp := map[string]interface{}{"genres": genres}
	data, _ := json.Marshal(resp)
	genresCache.Data = data
	genresCache.ExpiresAt = now.Add(24 * time.Hour)

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func recommendHandler(w http.ResponseWriter, r *http.Request) {
	genres := r.URL.Query().Get("genres") // comma-separated genre ids
	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	cacheKey := genres + ":" + page
	now := time.Now()
	if entry, ok := recommendCache[cacheKey]; ok && entry.Data != nil && entry.ExpiresAt.After(now) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(entry.Data)
		return
	}

	tmdbKey := getEnv("TMDB_API_KEY")
	discoverURL := fmt.Sprintf("https://api.themoviedb.org/3/discover/movie?api_key=%s&with_genres=%s&sort_by=popularity.desc&page=%s", url.QueryEscape(tmdbKey), url.QueryEscape(genres), url.QueryEscape(page))
	client := &http.Client{Timeout: 10 * time.Second}
	discoverResp, err := client.Get(discoverURL)
	if err != nil {
		http.Error(w, "Failed to fetch recommendations from TMDB", http.StatusBadGateway)
		return
	}
	defer discoverResp.Body.Close()
	if handleAPIError(w, discoverResp, "TMDB") {
		return
	}
	data, err := io.ReadAll(discoverResp.Body)
	if err != nil {
		http.Error(w, "Failed to read TMDB response", http.StatusInternalServerError)
		return
	}
	recommendCache[cacheKey] = struct {
		Data      []byte
		ExpiresAt time.Time
	}{Data: data, ExpiresAt: now.Add(10 * time.Minute)}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func getWatchlistHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT tmdb_id, type, title, poster_path, year, watched FROM watchlist")
	if err != nil {
		http.Error(w, "DB error", 500)
		return
	}
	defer rows.Close()
	var items []WatchlistItem
	for rows.Next() {
		var it WatchlistItem
		var watched int
		if err := rows.Scan(&it.TMDBID, &it.Type, &it.Title, &it.PosterPath, &it.Year, &watched); err == nil {
			it.Watched = watched == 1
			items = append(items, it)
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func addWatchlistHandler(w http.ResponseWriter, r *http.Request) {
	var it WatchlistItem
	if err := json.NewDecoder(r.Body).Decode(&it); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	_, err := db.Exec(`INSERT INTO watchlist (tmdb_id, type, title, poster_path, year, watched) VALUES (?, ?, ?, ?, ?, ?)`,
		it.TMDBID, it.Type, it.Title, it.PosterPath, it.Year, boolToInt(it.Watched))
	if err != nil {
		http.Error(w, "DB error", 500)
		return
	}
	w.WriteHeader(201)
}

func deleteWatchlistHandler(w http.ResponseWriter, r *http.Request) {
	tmdbID := r.URL.Query().Get("tmdb_id")
	typeParam := r.URL.Query().Get("type")
	if tmdbID == "" || typeParam == "" {
		http.Error(w, "Missing id/type", 400)
		return
	}
	_, err := db.Exec(`DELETE FROM watchlist WHERE tmdb_id = ? AND type = ?`, tmdbID, typeParam)
	if err != nil {
		http.Error(w, "DB error", 500)
		return
	}
	w.WriteHeader(204)
}

func markWatchedHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TMDBID  string `json:"tmdb_id"`
		Type    string `json:"type"`
		Watched bool   `json:"watched"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	_, err := db.Exec(`UPDATE watchlist SET watched = ? WHERE tmdb_id = ? AND type = ?`, boolToInt(req.Watched), req.TMDBID, req.Type)
	if err != nil {
		http.Error(w, "DB error", 500)
		return
	}
	w.WriteHeader(200)
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func allMoviesHandler(w http.ResponseWriter, r *http.Request) {
	tmdbKey := getEnv("TMDB_API_KEY")
	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	discoverURL := fmt.Sprintf("https://api.themoviedb.org/3/discover/movie?api_key=%s&sort_by=popularity.desc&page=%s", url.QueryEscape(tmdbKey), url.QueryEscape(page))
	client := &http.Client{Timeout: 10 * time.Second}
	discoverResp, err := client.Get(discoverURL)
	if err != nil {
		http.Error(w, "Failed to fetch movies from TMDB", http.StatusBadGateway)
		return
	}
	defer discoverResp.Body.Close()
	if handleAPIError(w, discoverResp, "TMDB") {
		return
	}
	data, err := io.ReadAll(discoverResp.Body)
	if err != nil {
		http.Error(w, "Failed to read TMDB response", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func main() {
	// Load .env file if present
	_ = godotenv.Load()
	initDB()
	frontendDir := "../frontend"
	if _, err := os.Stat(frontendDir); os.IsNotExist(err) {
		log.Fatalf("Frontend directory not found: %s", frontendDir)
	}

	http.Handle("/", http.FileServer(http.Dir(frontendDir)))
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	http.HandleFunc("/api/search", searchHandler)
	http.HandleFunc("/api/trending", trendingHandler)
	http.HandleFunc("/api/details", detailsHandler)
	http.HandleFunc("/api/genres", genresHandler)
	http.HandleFunc("/api/recommend", recommendHandler)
	http.HandleFunc("/api/watchlist", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getWatchlistHandler(w, r)
		case http.MethodPost:
			addWatchlistHandler(w, r)
		case http.MethodDelete:
			deleteWatchlistHandler(w, r)
		}
	})
	http.HandleFunc("/api/watchlist/watched", markWatchedHandler)
	http.HandleFunc("/api/all-movies", allMoviesHandler)

	log.Println("Server running on http://localhost:8080 ...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
