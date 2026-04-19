const businesses = [
  { id:1, name:"Tata Main Hospital", cat:"Healthcare", tag:"health", emoji:"🏥", bg:"#eaf3de", rating:4.6, reviews:312, open:true, addr:"C Road, Bistupur", desc:"Multi-speciality hospital with 24/7 emergency care, ICU, and over 40 departments.", verified:true },
  { id:2, name:"Hotel Kaveri", cat:"Restaurant & Hotel", tag:"food", emoji:"🍽️", bg:"#faeeda", rating:4.3, reviews:189, open:true, addr:"Main Road, Sakchi", desc:"Family restaurant serving authentic Indian and Chinese cuisine. Known for thali meals.", verified:true },
  { id:3, name:"SBI Main Branch", cat:"Banking & Finance", tag:"bank", emoji:"🏦", bg:"#e6f1fb", rating:3.9, reviews:421, open:false, addr:"Bistupur Market Area", desc:"State Bank of India's main Jamshedpur branch. All banking, loans and forex services.", verified:true },
  { id:4, name:"DPS Jamshedpur", cat:"Education", tag:"edu", emoji:"🎓", bg:"#fbeaf0", rating:4.8, reviews:204, open:true, addr:"Telco Colony", desc:"Premier CBSE school offering classes I-XII with science, commerce and arts streams.", verified:true },
  { id:5, name:"Big Bazaar Jugsalai", cat:"Shopping", tag:"shop", emoji:"🛍️", bg:"#eaf3de", rating:4.1, reviews:678, open:true, addr:"Jugsalai Main Road", desc:"India's largest hypermarket chain. Grocery, electronics, clothing under one roof.", verified:false },
  { id:6, name:"Apollo Clinic", cat:"Healthcare", tag:"health", emoji:"🩺", bg:"#eaf3de", rating:4.5, reviews:156, open:true, addr:"Bistupur, Near Post Office", desc:"Multi-specialty clinic with experienced doctors for general and specialist consultations.", verified:true },
];

let activeTag = 'all';

function renderBiz(list) {
  const grid = document.getElementById('bizGrid');
  if (!grid) return;
  grid.innerHTML = list.map(b => `
    <div class="biz-card">
      <div class="biz-logo-wrap" style="background:${b.bg}">${b.emoji}</div>
      <div class="biz-body">
        <div class="biz-top-row">
          <div>
            <div class="biz-name">${b.name} ${b.verified ? '<span class="verified">✓</span>' : ''}</div>
            <div class="biz-cat">${b.cat}</div>
          </div>
          <span class="status ${b.open ? 'open' : 'closed'}">${b.open ? 'Open' : 'Closed'}</span>
        </div>
        <p class="biz-desc">${b.desc}</p>
        <div class="biz-row2">
          <span class="stars">★★★★★</span>
          <span class="rating-val">${b.rating}</span>
          <span class="review-ct">(${b.reviews} reviews)</span>
        </div>
        <div class="biz-addr">📍 ${b.addr}</div>
        <div class="biz-actions">
          <a href="business.html?id=${b.id}" class="btn btn-primary">View details</a>
          <a href="map.html" class="btn btn-outline">Directions</a>
          <a href="business.html?id=${b.id}#reviews" class="btn btn-outline">Reviews</a>
        </div>
      </div>
    </div>
  `).join('');
}

function filterTag(el, tag) {
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeTag = tag;
  renderBiz(activeTag === 'all' ? businesses : businesses.filter(b => b.tag === activeTag));
}

function goSearch() {
  const q = document.getElementById('heroSearch').value;
  if (q) location.href = `listings.html?q=${encodeURIComponent(q)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderBiz(businesses);
  const searchInput = document.getElementById('heroSearch');
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(); });
});