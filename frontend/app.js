// Search input with debounce
const searchInput = document.getElementById('search-input');
let debounceTimeout = null;

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  clearTimeout(debounceTimeout);
  if (!query) {
    resultsList.innerHTML = '';
    return;
  }
  debounceTimeout = setTimeout(() => {
    fetchSearch(query, 1);
  }, 400);
});

function fetchSearch(query, page = 1) {
  setLoading(true);
  fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      renderResults(data.results);
    })
    .catch(() => setError('Error fetching results.'));
}

function renderResults(results) {
  resultsList.innerHTML = '';
  if (!results || results.length === 0) {
    resultsList.innerHTML = '<p>No results found.</p>';
    return;
  }
  results.forEach(item => {
    const data = item;
    const title = data.title || data.name || 'Untitled';
    const poster = data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : '';
    const type = data.media_type || 'unknown';
    const year = (data.release_date || data.first_air_date || '').slice(0, 4);
    const overview = data.overview || '';
    const html = `
      <div class="result-item">
        ${poster ? `<img src="${poster}" alt="${title}" />` : ''}
        <div class="result-info">
          <h3>${title} <span class="type">(${type}${year ? ', ' + year : ''})</span></h3>
          <p>${overview}</p>
        </div>
      </div>
    `;
    resultsList.innerHTML += html;
  });
}

function setLoading(isLoading) {
  if (isLoading) {
    resultsList.innerHTML = '<p>Loading...</p>';
  }
}

function setError(msg) {
  resultsList.innerHTML = `<p style="color:red;">${msg}</p>`;
}

function fetchTrending(page = 1) {
  setTrendingLoading(true);
  fetch(`/api/trending?page=${page}`)
    .then(res => res.json())
    .then(data => {
      renderTrending(data.results);
    })
    .catch(() => setTrendingError('Error fetching trending content.'));
}

function renderTrending(results) {
  trendingList.innerHTML = '';
  trendingList.parentNode.className = 'carousel';
  trendingList.className = 'carousel-list';
  if (!results || results.length === 0) {
    trendingList.innerHTML = '<p>No trending content found.</p>';
    return;
  }
  results.forEach(item => {
    const data = item;
    const title = data.title || data.name || 'Untitled';
    const poster = data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : '';
    const type = data.media_type || 'unknown';
    const year = (data.release_date || data.first_air_date || '').slice(0, 4);
    const html = `
      <div class="carousel-item result-item" data-id="${data.id}" data-type="${type}">
        ${poster ? `<img src="${poster}" alt="${title}" />` : '<div style="height:220px;background:#333;"></div>'}
        <div class="carousel-info">
          <div style="font-weight:bold;">${title}</div>
          <div style="font-size:0.95em;opacity:0.8;">${year}</div>
        </div>
      </div>
    `;
    trendingList.innerHTML += html;
  });
}

function setTrendingLoading(isLoading) {
  if (isLoading) {
    trendingList.innerHTML = '<p>Loading...</p>';
  }
}

function setTrendingError(msg) {
  trendingList.innerHTML = `<p style="color:red;">${msg}</p>`;
}