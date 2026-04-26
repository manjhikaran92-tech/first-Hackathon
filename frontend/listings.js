const API_URL = 'https://cityfind-backend.onrender.com/api';

let allBiz = [];
let minRating = 0;

// ========== FETCH FROM BACKEND ==========
async function fetchBusinesses(query = '') {
  try {
    let url = `${API_URL}/businesses?status=active&limit=50`;
    if (query) url += `&search=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
      allBiz = data.data?.businesses || data.data || [];
    } else {
      allBiz = getFallbackData();
    }
  } catch (err) {
    console.error('Backend error:', err);
    allBiz = getFallbackData();
  }

  applyFilters();
}

// ========== RENDER ==========
function renderBiz(list) {
  const container = document.getElementById('bizList');
  const countSpan = document.getElementById('resCount');
  if (!container) return;

  countSpan.textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--muted)">No results match your filters.</p>';
    return;
  }

  container.innerHTML = list.map(b => {
    const rating = b.rating?.average ?? b.rating ?? 0;
    const reviews = b.rating?.count ?? b.reviews ?? 0;
    const isOpen = b.isOpen ?? b.open ?? false;
    const category = b.categoryName || b.cat || b.category || '';
    const area = b.area || '';
    const address = b.address || b.addr || '';
    const desc = b.description || b.desc || '';
    const id = b._id || b.id;

    return `
      <a href="business.html?id=${id}" class="biz-card">
        <div class="biz-logo" style="background:#eaf3de">
          ${getCategoryEmoji(b.category || b.tag)}
        </div>
        <div class="biz-body">
          <div class="biz-row1">
            <div>
              <div class="biz-name">
                ${b.name}
                ${b.verified ? '<span class="verified">✓</span>' : ''}
                ${b.featured ? '<span class="featured-badge">Featured</span>' : ''}
              </div>
              <div class="biz-cat">${category} · ${area}</div>
            </div>
            <span class="status ${isOpen ? 'open' : 'closed'}">${isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <p class="biz-desc">${desc}</p>
          <div class="biz-meta">
            <span class="stars">${getStars(rating)}</span>
            <span class="r-val">${Number(rating).toFixed(1)}</span>
            <span class="r-ct">(${reviews} reviews)</span>
          </div>
          <div class="biz-addr">📍 ${address}</div>
        </div>
      </a>
    `;
  }).join('');
}

// ========== FILTERS ==========
function applyFilters() {
  const checkedCats = [...document.querySelectorAll('#catFilters input:checked')].map(i => i.value);
  const checkedAreas = [...document.querySelectorAll('.area-chk:checked')].map(i => i.value);
  const openOnly = document.getElementById('openOnly')?.checked;
  const verifiedOnly = document.getElementById('verifiedOnly')?.checked;
  const sortVal = document.querySelector('.sort-sel')?.value;
  const q = document.getElementById('searchQ')?.value.toLowerCase() || '';

  let filtered = allBiz.filter(b => {
    const cat = b.category || b.tag || '';
    const area = b.area || '';
    const rating = b.rating?.average ?? b.rating ?? 0;
    const isOpen = b.isOpen ?? b.open ?? false;
    const name = b.name?.toLowerCase() || '';
    const desc = (b.description || b.desc || '').toLowerCase();
    const catName = (b.categoryName || b.cat || '').toLowerCase();

    if (checkedCats.length && !checkedCats.includes(cat)) return false;
    if (checkedAreas.length && !checkedAreas.includes(area)) return false;
    if (openOnly && !isOpen) return false;
    if (verifiedOnly && !b.verified) return false;
    if (rating < minRating) return false;
    if (q && !name.includes(q) && !catName.includes(q) && !desc.includes(q)) return false;
    return true;
  });

  // Sort
  if (sortVal === 'rating') filtered.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
  else if (sortVal === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortVal === 'reviews') filtered.sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));

  renderBiz(filtered);
}

function applySearch() { applyFilters(); }

// ========== STAR RATING FILTER ==========
function setRating(btn, rating) {
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  minRating = rating;
  applyFilters();
}

// ========== CLEAR FILTERS ==========
function clearFilters() {
  document.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false);
  document.getElementById('searchQ').value = '';
  minRating = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  const firstStarBtn = document.querySelector('.star-btn');
  if (firstStarBtn) firstStarBtn.classList.add('active');
  applyFilters();
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

function getStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ========== FALLBACK DATA ==========
function getFallbackData() {
  return [
    { _id:'1', name:"Tata Main Hospital", category:"health", categoryName:"Healthcare", rating:{average:4.6,count:312}, isOpen:true, verified:true, area:"Bistupur", address:"C Road, Bistupur", description:"Multi-speciality hospital with 24/7 emergency, ICU, and over 40 departments.", featured:true },
    { _id:'2', name:"Hotel Kaveri", category:"food", categoryName:"Food & Dining", rating:{average:4.3,count:189}, isOpen:true, verified:true, area:"Sakchi", address:"Main Road, Sakchi", description:"Family restaurant serving authentic Indian and Chinese cuisine." },
    { _id:'3', name:"SBI Main Branch", category:"banking", categoryName:"Banking & Finance", rating:{average:3.9,count:421}, isOpen:false, verified:true, area:"Bistupur", address:"Bistupur Market Area", description:"State Bank of India's main Jamshedpur branch." },
    { _id:'4', name:"DPS Jamshedpur", category:"education", categoryName:"Education", rating:{average:4.8,count:204}, isOpen:true, verified:true, area:"Telco", address:"Telco Colony", description:"Premier CBSE school offering classes I-XII." },
    { _id:'5', name:"Big Bazaar Jugsalai", category:"shopping", categoryName:"Shopping", rating:{average:4.1,count:678}, isOpen:true, verified:false, area:"Jugsalai", address:"Jugsalai Main Road", description:"Hypermarket with grocery, electronics and clothing." },
    { _id:'6', name:"Apollo Clinic", category:"health", categoryName:"Healthcare", rating:{average:4.5,count:156}, isOpen:true, verified:true, area:"Bistupur", address:"Near Post Office, Bistupur", description:"Multi-specialty clinic for general and specialist consultations." },
    { _id:'7', name:"City Taxi Services", category:"transport", categoryName:"Transportation", rating:{average:3.7,count:95}, isOpen:true, verified:false, area:"Mango", address:"Mango Bus Stand", description:"Reliable local taxi services across Jamshedpur." },
    { _id:'8', name:"Jamshedpur Public Library", category:"education", categoryName:"Education", rating:{average:4.6,count:88}, isOpen:true, verified:true, area:"Bistupur", address:"Bistupur Cooperative Colony", description:"City's main public library with over 50,000 books." },
    { _id:'9', name:"HDFC Bank ATM", category:"banking", categoryName:"Banking & Finance", rating:{average:4.0,count:310}, isOpen:true, verified:true, area:"Sakchi", address:"Sakchi Market Complex", description:"24/7 ATM and banking services." },
    { _id:'10', name:"Dimna Dhaba", category:"food", categoryName:"Food & Dining", rating:{average:4.7,count:543}, isOpen:true, verified:false, area:"Telco", address:"Dimna Lake Road", description:"Iconic roadside dhaba near Dimna Lake." },
  ];
}

// ========== ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const cat = params.get('cat') || '';

  if (q) document.getElementById('searchQ').value = q;
  if (cat) {
    const cb = document.querySelector(`#catFilters input[value="${cat}"]`);
    if (cb) cb.checked = true;
  }

  fetchBusinesses(q);
});