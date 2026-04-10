/* ===========================================================
   CityFind – Homepage (index.html) script
   Fetches featured businesses + site stats from the backend API
   =========================================================== */
const API = 'http://localhost:3000/api';

// ── Load hero stats ────────────────────────────────────────
async function loadStats() {
  try {
    const res  = await fetch(`${API}/stats`);
    const data = await res.json();
    const nums = document.querySelectorAll('.hero-stat .num');
    if (nums[0]) nums[0].textContent = data.totalBusinesses.toLocaleString() + '+';
    if (nums[2]) nums[2].textContent = (data.monthlyVisitors / 1000).toFixed(0) + 'K';
  } catch (_) { /* keep static fallback values */ }
}

// ── Featured businesses grid ───────────────────────────────
let activeFeaturedTag = 'all';

async function loadFeatured(tag = 'all') {
  const grid = document.getElementById('bizGrid');
  grid.innerHTML = '<p style="padding:2rem;color:#6b7a8d;text-align:center;">Loading...</p>';

  try {
    const qs  = tag !== 'all' ? `?cat=${tag}&limit=6` : '?limit=6&sort=rating';
    const res = await fetch(`${API}/businesses${qs}`);
    const { businesses } = await res.json();
    renderGrid(businesses);
  } catch (err) {
    grid.innerHTML = '<p style="padding:2rem;color:#e24b4a;text-align:center;">Could not load businesses. Is the backend running?</p>';
    console.error('API error:', err);
  }
}

function renderGrid(list) {
  const grid = document.getElementById('bizGrid');
  if (!list || list.length === 0) {
    grid.innerHTML = '<p style="padding:2rem;color:#6b7a8d;text-align:center;">No businesses found.</p>';
    return;
  }
  grid.innerHTML = list.map(b => `
    <div class="biz-card">
      <div class="biz-logo-wrap" style="background:${b.bgColor}">${b.emoji}</div>
      <div class="biz-body">
        <div class="biz-top-row">
          <div>
            <div class="biz-name">${b.name} ${b.isVerified ? '<span class="verified">✓</span>' : ''}</div>
            <div class="biz-cat">${b.category}</div>
          </div>
          <span class="status ${b.isOpen ? 'open' : 'closed'}">${b.isOpen ? 'Open' : 'Closed'}</span>
        </div>
        <p class="biz-desc">${b.description}</p>
        <div class="biz-row2">
          <span class="stars">★★★★★</span>
          <span class="rating-val">${b.rating}</span>
          <span class="review-ct">(${b.reviewCount} reviews)</span>
        </div>
        <div class="biz-addr">📍 ${b.address}</div>
        <div class="biz-actions">
          <a href="./business/business.html?id=${b._id}" class="btn btn-primary">View details</a>
          <a href="./map/map.html" class="btn btn-outline">Directions</a>
          <a href="./business/business.html?id=${b._id}#reviews" class="btn btn-outline">Reviews</a>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Tag filter buttons ─────────────────────────────────────
function filterTag(el, tag) {
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeFeaturedTag = tag;
  loadFeatured(tag);
}

// ── Search bar ─────────────────────────────────────────────
function goSearch() {
  const q = document.getElementById('heroSearch').value.trim();
  if (q) location.href = `./listings/listings.html?q=${encodeURIComponent(q)}`;
}

document.getElementById('heroSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') goSearch();
});

// ── Init ───────────────────────────────────────────────────
loadStats();
loadFeatured();
