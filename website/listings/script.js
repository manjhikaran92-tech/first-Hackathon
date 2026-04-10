/* ===========================================================
   CityFind – Listings page script
   Fetches all businesses from backend with filters/sort/search
   =========================================================== */
const API = 'http://localhost:3000/api';

let minRating = 0;
let currentPage = 1;

// ── Build filter state from DOM ─────────────────────────────
function buildParams() {
  const checkedCats  = [...document.querySelectorAll('#catFilters input:checked')].map(i => i.value);
  const checkedAreas = [...document.querySelectorAll('.area-chk:checked')].map(i => i.value);
  const openOnly     = document.getElementById('openOnly').checked;
  const verifiedOnly = document.getElementById('verifiedOnly').checked;
  const sortVal      = document.querySelector('.sort-sel').value;
  const q            = document.getElementById('searchQ').value.trim();

  const params = new URLSearchParams();
  if (q)                         params.set('q', q);
  if (checkedCats.length)        params.set('cat', checkedCats.join(','));
  if (checkedAreas.length)       params.set('area', checkedAreas.join(','));
  if (openOnly)                  params.set('open', 'true');
  if (verifiedOnly)              params.set('verified', 'true');
  if (minRating > 0)             params.set('minRating', minRating);
  if (sortVal)                   params.set('sort', sortVal);
  params.set('page', currentPage);
  params.set('limit', 12);
  return params;
}

// ── Fetch and render ────────────────────────────────────────
async function applyFilters() {
  const list = document.getElementById('bizList');
  list.innerHTML = '<p style="padding:2rem;text-align:center;color:#6b7a8d;">Loading...</p>';

  try {
    const res  = await fetch(`${API}/businesses?${buildParams()}`);
    const data = await res.json();
    const { businesses, pagination } = data;

    document.getElementById('resCount').textContent = pagination.total;
    renderBiz(businesses);
    renderPagination(pagination);
  } catch (err) {
    list.innerHTML = '<p style="padding:2rem;color:#e24b4a;text-align:center;">Could not load listings. Is the backend running?</p>';
    console.error('API error:', err);
  }
}

function renderBiz(list) {
  const container = document.getElementById('bizList');
  if (!list || list.length === 0) {
    container.innerHTML = '<p style="padding:2rem;text-align:center;color:#6b7a8d;">No results match your filters.</p>';
    return;
  }
  container.innerHTML = list.map(b => `
    <a href="../business/business.html?id=${b._id}" class="biz-card">
      <div class="biz-logo" style="background:${b.bgColor}">${b.emoji}</div>
      <div class="biz-body">
        <div class="biz-row1">
          <div>
            <div class="biz-name">${b.name}
              ${b.isVerified ? '<span class="verified">✓</span>' : ''}
              ${b.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="biz-cat">${b.category} · ${b.area}</div>
          </div>
          <span class="status ${b.isOpen ? 'open' : 'closed'}">${b.isOpen ? 'Open' : 'Closed'}</span>
        </div>
        <p class="biz-desc">${b.description}</p>
        <div class="biz-meta">
          <span class="stars">★★★★★</span>
          <span class="r-val">${b.rating}</span>
          <span class="r-ct">(${b.reviewCount} reviews)</span>
        </div>
        <div class="biz-addr">📍 ${b.address}</div>
      </div>
    </a>`).join('');
}

function renderPagination({ page, pages }) {
  const pg = document.querySelector('.pagination');
  if (!pg || pages <= 1) { if (pg) pg.innerHTML = ''; return; }
  let html = '';
  if (page > 1) html += `<button class="pg-btn" onclick="goPage(${page - 1})">←</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="pg-btn ${i === page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  if (page < pages) html += `<button class="pg-btn" onclick="goPage(${page + 1})">→</button>`;
  pg.innerHTML = html;
}

function goPage(n) { currentPage = n; applyFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ── Rating filter ───────────────────────────────────────────
function setRating(el, r) {
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  minRating = r;
  currentPage = 1;
  applyFilters();
}

// ── Search button ───────────────────────────────────────────
function applySearch() { currentPage = 1; applyFilters(); }

// ── Clear all filters ───────────────────────────────────────
function clearFilters() {
  document.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false);
  document.getElementById('searchQ').value = '';
  document.querySelector('.sort-sel').value = 'rating';
  minRating = 0; currentPage = 1;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.star-btn').classList.add('active');
  applyFilters();
}

// ── Read URL params on load ─────────────────────────────────
const params = new URLSearchParams(location.search);
if (params.get('q'))   document.getElementById('searchQ').value = params.get('q');
if (params.get('cat')) {
  const cb = document.querySelector(`#catFilters input[value="${params.get('cat')}"]`);
  if (cb) cb.checked = true;
}

applyFilters();
