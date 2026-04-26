const API_URL = 'https://cityfind-backend.onrender.com/api';

let activeTag = 'all';
let allBusinesses = [];

// Category tag to backend enum mapping
const tagMap = {
  'health': 'health',
  'food': 'food',
  'bank': 'banking',
  'edu': 'education',
  'shop': 'shopping'
};

// ========== BUSINESSES FETCH FROM BACKEND ==========
async function fetchBusinesses() {
  try {
    const res = await fetch(`${API_URL}/businesses?limit=6&status=active`);
    const data = await res.json();

    if (res.ok && data.data) {
      allBusinesses = data.data.businesses || data.data || [];
      renderBiz(allBusinesses);
    } else {
      // Backend se nahi aaya toh fallback data dikhao
      renderFallback();
    }
  } catch (err) {
    console.error('Backend connect nahi ho pa raha:', err);
    renderFallback();
  }
}

// ========== RENDER BUSINESSES ==========
function renderBiz(list) {
  const grid = document.getElementById('bizGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:2rem;">Koi business nahi mila.</p>';
    return;
  }

  grid.innerHTML = list.map(b => {
    const rating = b.rating?.average || 0;
    const reviews = b.rating?.count || b.reviewCount || 0;
    const isOpen = b.isOpen || false;
    const image = b.images?.find(i => i.isPrimary)?.url || null;

    return `
      <div class="biz-card">
        <div class="biz-logo-wrap" style="background:#eaf3de">
          ${image
            ? `<img src="http://localhost:5000${image}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">`
            : getCategoryEmoji(b.category)
          }
        </div>
        <div class="biz-body">
          <div class="biz-top-row">
            <div>
              <div class="biz-name">
                ${b.name}
                ${b.verified ? '<span class="verified">✓</span>' : ''}
              </div>
              <div class="biz-cat">${b.categoryName || b.category}</div>
            </div>
            <span class="status ${isOpen ? 'open' : 'closed'}">${isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <p class="biz-desc">${b.description}</p>
          <div class="biz-row2">
            <span class="stars">${getStars(rating)}</span>
            <span class="rating-val">${rating.toFixed(1)}</span>
            <span class="review-ct">(${reviews} reviews)</span>
          </div>
          <div class="biz-addr">📍 ${b.address}, ${b.area}</div>
          <div class="biz-actions">
            <a href="business.html?id=${b._id}" class="btn btn-primary">View details</a>
            <a href="map.html?id=${b._id}" class="btn btn-outline">Directions</a>
            <a href="business.html?id=${b._id}#reviews" class="btn btn-outline">Reviews</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========== HELPER FUNCTIONS ==========
function getCategoryEmoji(category) {
  const emojis = {
    'food': '🍽️',
    'health': '🏥',
    'education': '🎓',
    'banking': '🏦',
    'shopping': '🛍️',
    'transport': '🚗',
    'government': '🏛️',
    'hotel': '🏨',
    'salon': '💇',
    'legal': '⚖️',
    'it': '💻',
    'other': '🏢'
  };
  return emojis[category] || '🏢';
}

function getStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ========== FILTER BY TAG ==========
function filterTag(el, tag) {
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeTag = tag;

  if (tag === 'all') {
    renderBiz(allBusinesses);
  } else {
    const backendTag = tagMap[tag] || tag;
    const filtered = allBusinesses.filter(b => b.category === backendTag);
    renderBiz(filtered);
  }
}

// ========== SEARCH ==========
function goSearch() {
  const q = document.getElementById('heroSearch').value.trim();
  if (q) location.href = `listings.html?q=${encodeURIComponent(q)}`;
}

// ========== FALLBACK DATA (jab backend nahi chale) ==========
function renderFallback() {
  const fallback = [
    { _id:'1', name:"Tata Main Hospital", categoryName:"Healthcare", category:"health", rating:{average:4.6, count:312}, isOpen:true, address:"C Road", area:"Bistupur", description:"Multi-speciality hospital with 24/7 emergency care.", verified:true },
    { _id:'2', name:"Hotel Kaveri", categoryName:"Food & Dining", category:"food", rating:{average:4.3, count:189}, isOpen:true, address:"Main Road", area:"Sakchi", description:"Family restaurant serving authentic Indian and Chinese cuisine.", verified:true },
    { _id:'3', name:"SBI Main Branch", categoryName:"Banking & Finance", category:"banking", rating:{average:3.9, count:421}, isOpen:false, address:"Bistupur Market Area", area:"Bistupur", description:"State Bank of India's main Jamshedpur branch.", verified:true },
    { _id:'4', name:"DPS Jamshedpur", categoryName:"Education", category:"education", rating:{average:4.8, count:204}, isOpen:true, address:"Telco Colony", area:"Telco", description:"Premier CBSE school offering classes I-XII.", verified:true },
    { _id:'5', name:"Big Bazaar Jugsalai", categoryName:"Shopping", category:"shopping", rating:{average:4.1, count:678}, isOpen:true, address:"Jugsalai Main Road", area:"Jugsalai", description:"India's largest hypermarket chain.", verified:false },
    { _id:'6', name:"Apollo Clinic", categoryName:"Healthcare", category:"health", rating:{average:4.5, count:156}, isOpen:true, address:"Near Post Office", area:"Bistupur", description:"Multi-specialty clinic with experienced doctors.", verified:true },
  ];
  allBusinesses = fallback;
  renderBiz(fallback);
}

// ========== ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  fetchBusinesses(); // Backend se data lao

  const searchInput = document.getElementById('heroSearch');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') goSearch();
    });
  }
});