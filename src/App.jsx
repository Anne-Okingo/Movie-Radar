import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Search from './pages/Search'
import Watchlist from './pages/Watchlist'
import MovieDetails from './pages/MovieDetails'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<MovieDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
