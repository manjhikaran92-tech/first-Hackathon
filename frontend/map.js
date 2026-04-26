const API_URL = 'https://cityfind-backend.onrender.com/api';

let allBusinesses = [];
let activeTag = 'all';
let mapInstance = null;
let markers = {};

// ========== PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  fetchBusinesses();
});

// ========== INIT MAP ==========
function initMap() {
  mapInstance = L.map('map').setView([22.7964, 86.2029], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);
}

// ========== FETCH BUSINESSES ==========
async function fetchBusinesses() {
  try {
    const res = await fetch(`${API_URL}/businesses?status=active&limit=100`);
    const data = await res.json();

    if (res.ok) {
      allBusinesses = data.data?.businesses || data.data || [];
    } else {
      allBusinesses = getFallbackData();
    }
  } catch (err) {
    console.error('Backend error:', err);
    allBusinesses = getFallbackData();
  }

  addMarkers(allBusinesses);
  renderList();

  // URL se id aaya ho toh focus karo
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) {
    const biz = allBusinesses.find(b => b._id === id || b.id === id);
    if (biz) focusBiz(biz._id || biz.id);
  }
}

// ========== ADD MARKERS ==========
function addMarkers(businesses) {
  // Purane markers hatao
  Object.values(markers).forEach(m => mapInstance.removeLayer(m));
  markers = {};

  businesses.forEach(b => {
    const lat = b.coordinates?.lat || b.lat;
    const lng = b.coordinates?.lng || b.lng;
    if (!lat || !lng) return;

    const emoji = getCategoryEmoji(b.category || b.tag);
    const html = `
      <div style="background:#eaf3de;border:2px solid #0a2540;border-radius:50%;
        width:36px;height:36px;display:flex;align-items:center;justify-content:center;
        font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer;">
        ${emoji}
      </div>`;

    const icon = L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
    const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);
    marker.on('click', () => showInfo(b));

    const id = b._id || b.id;
    markers[id] = marker;
  });
}

// ========== FILTER CHIP ==========
function filterChip(el, tag) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  activeTag = tag;
  renderList();
}

function filterList() { renderList(); }

// ========== RENDER LIST ==========
function renderList() {
  const q = document.getElementById('panelSearch')?.value.toLowerCase() || '';

  const filtered = allBusinesses.filter(b => {
    const cat = b.category || b.tag || '';
    const catName = (b.categoryName || b.cat || '').toLowerCase();
    const name = b.name?.toLowerCase() || '';

    if (activeTag !== 'all' && cat !== activeTag) return false;
    if (q && !name.includes(q) && !catName.includes(q)) return false;
    return true;
  });

  const countEl = document.getElementById('panelCount');
  const listEl = document.getElementById('panelList');

  if (countEl) countEl.textContent = `Showing ${filtered.length} businesses`;
  if (!listEl) return;

  listEl.innerHTML = filtered.map(b => {
    const id = b._id || b.id;
    const isOpen = b.isOpen ?? b.open ?? false;
    const rating = b.rating?.average ?? b.rating ?? 0;
    const reviews = b.rating?.count ?? b.reviews ?? 0;
    const cat = b.categoryName || b.cat || b.category || '';
    const addr = b.address || b.addr || '';

    return `
      <div class="biz-item" onclick="focusBiz('${id}')">
        <div class="open-dot ${isOpen ? 'dot-open' : 'dot-closed'}"></div>
        <div class="biz-em" style="background:#eaf3de">
          ${getCategoryEmoji(b.category || b.tag)}
        </div>
        <div class="biz-info">
          <div class="biz-nm">${b.name}</div>
          <div class="biz-ct">${cat} · ${addr}</div>
          <div class="biz-r">
            <span class="r-star">★</span>
            <span class="r-num">${Number(rating).toFixed(1)}</span>
            <span style="font-size:11px;color:var(--muted)">(${reviews})</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== FOCUS BUSINESS ==========
function focusBiz(id) {
  const b = allBusinesses.find(x => (x._id || x.id) === id);
  if (!b) return;

  const lat = b.coordinates?.lat || b.lat;
  const lng = b.coordinates?.lng || b.lng;

  if (lat && lng) mapInstance.setView([lat, lng], 16);

  showInfo(b);

  // Active class lagao
  document.querySelectorAll('.biz-item').forEach(el => {
    el.classList.remove('active');
    if (el.getAttribute('onclick')?.includes(id)) el.classList.add('active');
  });
}

// ========== SHOW INFO CARD ==========
function showInfo(b) {
  const id = b._id || b.id;
  const isOpen = b.isOpen ?? b.open ?? false;
  const rating = b.rating?.average ?? b.rating ?? 0;
  const reviews = b.rating?.count ?? b.reviews ?? 0;
  const addr = b.address || b.addr || '';
  const cat = b.categoryName || b.cat || b.category || '';

  const emEl = document.getElementById('ic-em');
  if (emEl) {
    emEl.textContent = getCategoryEmoji(b.category || b.tag);
    emEl.style.background = '#eaf3de';
  }

  const nameEl = document.getElementById('ic-name');
  if (nameEl) nameEl.textContent = b.name;

  const catEl = document.getElementById('ic-cat');
  if (catEl) catEl.textContent = cat;

  const metaEl = document.getElementById('ic-meta');
  if (metaEl) metaEl.innerHTML = `
    📍 ${addr}<br>
    ★ ${Number(rating).toFixed(1)} · ${reviews} reviews ·
    <span style="color:${isOpen ? '#1d9e75' : '#e24b4a'}">
      ${isOpen ? 'Open now' : 'Closed'}
    </span>
  `;

  const detailsEl = document.getElementById('ic-details');
  if (detailsEl) detailsEl.href = `business.html?id=${id}`;

  const infoCard = document.getElementById('infoCard');
  if (infoCard) infoCard.style.display = 'block';
}

// ========== CLOSE INFO ==========
function closeInfo() {
  const infoCard = document.getElementById('infoCard');
  if (infoCard) infoCard.style.display = 'none';
}

// ========== HELPERS ==========
function getCategoryEmoji(category) {
  const emojis = {
    'food': '🍽️', 'health': '🏥', 'education': '🎓',
    'banking': '🏦', 'bank': '🏦', 'shopping': '🛍️',
    'shop': '🛍️', 'transport': '🚗', 'trans': '🚗',
    'government': '🏛️', 'hotel': '🏨', 'salon': '💇',
    'legal': '⚖️', 'it': '💻', 'edu': '🎓', 'other': '🏢'
  };
  return emojis[category] || '🏢';
}

// ========== FALLBACK DATA ==========
function getFallbackData() {
  return [
    { _id:'1', name:"Tata Main Hospital", category:"health", categoryName:"Healthcare", rating:{average:4.6,count:312}, isOpen:true, address:"C Road, Bistupur", area:"Bistupur", coordinates:{lat:22.8046,lng:86.2029} },
    { _id:'2', name:"Hotel Kaveri", category:"food", categoryName:"Food & Dining", rating:{average:4.3,count:189}, isOpen:true, address:"Main Road, Sakchi", area:"Sakchi", coordinates:{lat:22.7932,lng:86.1851} },
    { _id:'3', name:"SBI Main Branch", category:"banking", categoryName:"Banking & Finance", rating:{average:3.9,count:421}, isOpen:false, address:"Bistupur Market", area:"Bistupur", coordinates:{lat:22.8051,lng:86.2045} },
    { _id:'4', name:"DPS Jamshedpur", category:"education", categoryName:"Education", rating:{average:4.8,count:204}, isOpen:true, address:"Telco Colony", area:"Telco", coordinates:{lat:22.7714,lng:86.2109} },
    { _id:'5', name:"Big Bazaar", category:"shopping", categoryName:"Shopping", rating:{average:4.1,count:678}, isOpen:true, address:"Jugsalai", area:"Jugsalai", coordinates:{lat:22.7849,lng:86.1897} },
    { _id:'6', name:"Apollo Clinic", category:"health", categoryName:"Healthcare", rating:{average:4.5,count:156}, isOpen:true, address:"Bistupur", area:"Bistupur", coordinates:{lat:22.8039,lng:86.2056} },
  ];
}