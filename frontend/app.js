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