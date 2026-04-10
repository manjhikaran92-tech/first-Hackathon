/* ===========================================================
   CityFind – Map page script
   Fetches businesses from API and renders Leaflet map + panel
   =========================================================== */
const API = 'http://localhost:3000/api';

const map = L.map('map').setView([22.7964, 86.2029], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let allBusinesses = [];
let markers       = {};
let activeTag     = 'all';

// ── Fetch all businesses from API ───────────────────────────
async function loadBusinesses() {
  try {
    const res = await fetch(`${API}/businesses?limit=50`);
    const { businesses } = await res.json();
    // Only keep those that have lat/lng
    allBusinesses = businesses.filter(b => b.lat && b.lng);
    addMarkers();
    renderList();
  } catch (err) {
    document.getElementById('panelCount').textContent = 'Could not load businesses.';
    console.error('API error:', err);
  }
}

// ── Add map markers ─────────────────────────────────────────
function addMarkers() {
  // Remove old markers
  Object.values(markers).forEach(m => m.remove());
  markers = {};

  allBusinesses.forEach(b => {
    const html = `<div style="background:${b.bgColor};border:2px solid #0a2540;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer;">${b.emoji}</div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
    const m    = L.marker([b.lat, b.lng], { icon }).addTo(map);
    m.on('click', () => showInfo(b));
    markers[b._id] = m;
  });
}

// ── Category chip filter ────────────────────────────────────
function filterChip(el, tag) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeTag = tag;
  renderList();
}

function filterList() { renderList(); }

// ── Render side panel list ──────────────────────────────────
function renderList() {
  const q = document.getElementById('panelSearch').value.toLowerCase();
  const filtered = allBusinesses.filter(b => {
    if (activeTag !== 'all' && b.tag !== activeTag) return false;
    if (q && !b.name.toLowerCase().includes(q) && !b.category.toLowerCase().includes(q)) return false;
    return true;
  });

  document.getElementById('panelCount').textContent = `Showing ${filtered.length} businesses`;
  document.getElementById('panelList').innerHTML = filtered.map(b => `
    <div class="biz-item" onclick="focusBiz('${b._id}')">
      <div class="open-dot ${b.isOpen ? 'dot-open' : 'dot-closed'}"></div>
      <div class="biz-em" style="background:${b.bgColor}">${b.emoji}</div>
      <div class="biz-info">
        <div class="biz-nm">${b.name}</div>
        <div class="biz-ct">${b.category} · ${b.address}</div>
        <div class="biz-r"><span class="r-star">★</span><span class="r-num">${b.rating}</span><span style="font-size:11px;color:var(--muted)">(${b.reviewCount})</span></div>
      </div>
    </div>`).join('');
}

// ── Focus on a business ─────────────────────────────────────
function focusBiz(id) {
  const b = allBusinesses.find(x => x._id === id);
  if (!b) return;
  map.setView([b.lat, b.lng], 16);
  showInfo(b);
  document.querySelectorAll('.biz-item').forEach(el => {
    el.classList.toggle('active', el.onclick.toString().includes(`'${id}'`));
  });
}

// ── Show info card popup ────────────────────────────────────
function showInfo(b) {
  document.getElementById('ic-em').textContent       = b.emoji;
  document.getElementById('ic-em').style.background  = b.bgColor;
  document.getElementById('ic-name').textContent     = b.name;
  document.getElementById('ic-cat').textContent      = b.category;
  document.getElementById('ic-meta').innerHTML = `
    📍 ${b.address}<br>
    ★ ${b.rating} · ${b.reviewCount} reviews ·
    <span style="color:${b.isOpen ? '#1d9e75' : '#e24b4a'}">${b.isOpen ? 'Open now' : 'Closed'}</span>
  `;
  document.getElementById('ic-details').href = `../business/business.html?id=${b._id}`;
  document.getElementById('infoCard').style.display = 'block';
}

function closeInfo() {
  document.getElementById('infoCard').style.display = 'none';
}

loadBusinesses();
