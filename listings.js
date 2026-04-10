const allBiz = [
  {id:1,name:"Tata Main Hospital",cat:"Healthcare",tag:"health",emoji:"🏥",bg:"#eaf3de",rating:4.6,reviews:312,open:true,verified:true,area:"Bistupur",addr:"C Road, Bistupur",desc:"Multi-speciality hospital with 24/7 emergency, ICU, and over 40 departments.",featured:true},
  {id:2,name:"Hotel Kaveri",cat:"Restaurant",tag:"food",emoji:"🍽️",bg:"#faeeda",rating:4.3,reviews:189,open:true,verified:true,area:"Sakchi",addr:"Main Road, Sakchi",desc:"Family restaurant serving authentic Indian and Chinese cuisine."},
  {id:3,name:"SBI Main Branch",cat:"Banking",tag:"bank",emoji:"🏦",bg:"#e6f1fb",rating:3.9,reviews:421,open:false,verified:true,area:"Bistupur",addr:"Bistupur Market Area",desc:"State Bank of India's main Jamshedpur branch with all banking services."},
  {id:4,name:"DPS Jamshedpur",cat:"Education",tag:"edu",emoji:"🎓",bg:"#fbeaf0",rating:4.8,reviews:204,open:true,verified:true,area:"Telco",addr:"Telco Colony",desc:"Premier CBSE school offering classes I-XII with top facilities."},
  {id:5,name:"Big Bazaar Jugsalai",cat:"Shopping",tag:"shop",emoji:"🛍️",bg:"#eaf3de",rating:4.1,reviews:678,open:true,verified:false,area:"Jugsalai",addr:"Jugsalai Main Road",desc:"Hypermarket with grocery, electronics and clothing under one roof."},
  {id:6,name:"Apollo Clinic",cat:"Healthcare",tag:"health",emoji:"🩺",bg:"#eaf3de",rating:4.5,reviews:156,open:true,verified:true,area:"Bistupur",addr:"Bistupur, Near Post Office",desc:"Multi-specialty clinic for general and specialist medical consultations."},
  {id:7,name:"City Taxi Services",cat:"Transport",tag:"trans",emoji:"🚗",bg:"#faece7",rating:3.7,reviews:95,open:true,verified:false,area:"Mango",addr:"Mango Bus Stand",desc:"Reliable local taxi services across Jamshedpur at affordable rates."},
  {id:8,name:"Jamshedpur Public Library",cat:"Education",tag:"edu",emoji:"📚",bg:"#fbeaf0",rating:4.6,reviews:88,open:true,verified:true,area:"Bistupur",addr:"Bistupur Cooperative Colony",desc:"City's main public library with over 50,000 books and e-resources."},
  {id:9,name:"HDFC Bank ATM",cat:"Banking",tag:"bank",emoji:"💳",bg:"#e6f1fb",rating:4.0,reviews:310,open:true,verified:true,area:"Sakchi",addr:"Sakchi Market Complex",desc:"24/7 ATM and banking services including locker facility."},
  {id:10,name:"Dimna Dhaba",cat:"Restaurant",tag:"food",emoji:"🍛",bg:"#faeeda",rating:4.7,reviews:543,open:true,verified:false,area:"Telco",addr:"Dimna Lake Road",desc:"Iconic roadside dhaba near Dimna Lake famous for dal-baati and litti chokha."},
];

let minRating = 0;

function renderBiz(list) {
  const container = document.getElementById('bizList');
  const countSpan = document.getElementById('resCount');
  if (!container) return;
  countSpan.textContent = list.length;
  container.innerHTML = list.length === 0
    ? '<p style="padding:2rem;text-align:center;color:var(--muted)">No results match your filters.</p>'
    : list.map(b => `
    <a href="business.html?id=${b.id}" class="biz-card">
      <div class="biz-logo" style="background:${b.bg}">${b.emoji}</div>
      <div class="biz-body">
        <div class="biz-row1">
          <div>
            <div class="biz-name">${b.name} ${b.verified ? '<span class="verified">✓</span>' : ''} ${b.featured ? '<span class="featured-badge">Featured</span>' : ''}</div>
            <div class="biz-cat">${b.cat} · ${b.area}</div>
          </div>
          <span class="status ${b.open?'open':'closed'}">${b.open?'Open':'Closed'}</span>
        </div>
        <p class="biz-desc">${b.desc}</p>
        <div class="biz-meta">
          <span class="stars">★★★★★</span>
          <span class="r-val">${b.rating}</span>
          <span class="r-ct">(${b.reviews} reviews)</span>
        </div>
        <div class="biz-addr">📍 ${b.addr}</div>
      </div>
    </a>`).join('');
}

function applyFilters() {
  const checkedCats = [...document.querySelectorAll('#catFilters input:checked')].map(i => i.value);
  const checkedAreas = [...document.querySelectorAll('.area-chk:checked')].map(i => i.value);
  const openOnly = document.getElementById('openOnly').checked;
  const verifiedOnly = document.getElementById('verifiedOnly').checked;
  const sortVal = document.querySelector('.sort-sel').value;
  const q = document.getElementById('searchQ').value.toLowerCase();

  let filtered = allBiz.filter(b => {
    if (checkedCats.length && !checkedCats.includes(b.tag)) return false;
    if (checkedAreas.length && !checkedAreas.includes(b.area)) return false;
    if (openOnly && !b.open) return false;
    if (verifiedOnly && !b.verified) return false;
    if (b.rating < minRating) return false;
    if (q && !b.name.toLowerCase().includes(q) && !b.cat.toLowerCase().includes(q) && !b.desc.toLowerCase().includes(q)) return false;
    return true;
  });

  if (sortVal === 'rating') filtered.sort((a,b) => b.rating - a.rating);
  else if (sortVal === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
  else if (sortVal === 'reviews') filtered.sort((a,b) => b.reviews - a.reviews);

  renderBiz(filtered);
}

function applySearch() { applyFilters(); }

function setRating(btn, rating) {
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  minRating = rating;
  applyFilters();
}

function clearFilters() {
  document.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false);
  document.getElementById('openOnly').checked = false;
  document.getElementById('verifiedOnly').checked = false;
  document.getElementById('searchQ').value = '';
  minRating = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.star-btn').classList.add('active');
  renderBiz(allBiz);
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  if (params.get('q')) document.getElementById('searchQ').value = params.get('q');
  if (params.get('cat')) {
    const cb = document.querySelector(`#catFilters input[value="${params.get('cat')}"]`);
    if (cb) cb.checked = true;
  }
  applyFilters();
});