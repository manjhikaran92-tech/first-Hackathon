const businesses = [
  {id:1,name:"Tata Main Hospital",cat:"Healthcare",tag:"health",emoji:"🏥",bg:"#eaf3de",rating:4.6,reviews:312,open:true,addr:"C Road, Bistupur",lat:22.8046,lng:86.2029},
  {id:2,name:"Hotel Kaveri",cat:"Restaurant",tag:"food",emoji:"🍽️",bg:"#faeeda",rating:4.3,reviews:189,open:true,addr:"Main Road, Sakchi",lat:22.7932,lng:86.1851},
  {id:3,name:"SBI Main Branch",cat:"Banking",tag:"bank",emoji:"🏦",bg:"#e6f1fb",rating:3.9,reviews:421,open:false,addr:"Bistupur Market",lat:22.8051,lng:86.2045},
  {id:4,name:"DPS Jamshedpur",cat:"Education",tag:"edu",emoji:"🎓",bg:"#fbeaf0",rating:4.8,reviews:204,open:true,addr:"Telco Colony",lat:22.7714,lng:86.2109},
  {id:5,name:"Big Bazaar",cat:"Shopping",tag:"shop",emoji:"🛍️",bg:"#eaf3de",rating:4.1,reviews:678,open:true,addr:"Jugsalai",lat:22.7849,lng:86.1897},
  {id:6,name:"Apollo Clinic",cat:"Healthcare",tag:"health",emoji:"🩺",bg:"#eaf3de",rating:4.5,reviews:156,open:true,addr:"Bistupur",lat:22.8039,lng:86.2056},
];

const map = L.map('map').setView([22.7964,86.2029],14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);

const markers = {};
businesses.forEach(b => {
  const html = `<div style="background:${b.bg};border:2px solid #0a2540;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer;">${b.emoji}</div>`;
  const icon = L.divIcon({html,className:'',iconSize:[36,36],iconAnchor:[18,18]});
  const m = L.marker([b.lat,b.lng],{icon}).addTo(map);
  m.on('click',() => showInfo(b));
  markers[b.id] = m;
});

let activeTag = 'all';
function filterChip(el, tag) {
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  activeTag = tag;
  renderList();
}

function filterList() { renderList(); }

function renderList() {
  const q = document.getElementById('panelSearch').value.toLowerCase();
  const filtered = businesses.filter(b => {
    if (activeTag !== 'all' && b.tag !== activeTag) return false;
    if (q && !b.name.toLowerCase().includes(q) && !b.cat.toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById('panelCount').textContent = `Showing ${filtered.length} businesses`;
  document.getElementById('panelList').innerHTML = filtered.map(b => `
    <div class="biz-item" onclick="focusBiz(${b.id})">
      <div class="open-dot ${b.open?'dot-open':'dot-closed'}"></div>
      <div class="biz-em" style="background:${b.bg}">${b.emoji}</div>
      <div class="biz-info">
        <div class="biz-nm">${b.name}</div>
        <div class="biz-ct">${b.cat} · ${b.addr}</div>
        <div class="biz-r"><span class="r-star">★</span><span class="r-num">${b.rating}</span><span style="font-size:11px;color:var(--muted)">(${b.reviews})</span></div>
      </div>
    </div>`).join('');
}

function focusBiz(id) {
  const b = businesses.find(x=>x.id===id);
  if (!b) return;
  map.setView([b.lat,b.lng],16);
  showInfo(b);
  document.querySelectorAll('.biz-item').forEach((el,i)=>{
    el.classList.toggle('active', businesses[i]?.id===id);
  });
}

function showInfo(b) {
  document.getElementById('ic-em').textContent = b.emoji;
  document.getElementById('ic-em').style.background = b.bg;
  document.getElementById('ic-name').textContent = b.name;
  document.getElementById('ic-cat').textContent = b.cat;
  document.getElementById('ic-meta').innerHTML = `
    📍 ${b.addr}<br>
    ★ ${b.rating} · ${b.reviews} reviews · 
    <span style="color:${b.open?'#1d9e75':'#e24b4a'}">${b.open?'Open now':'Closed'}</span>
  `;
  document.getElementById('ic-details').href = `business.html?id=${b.id}`;
  document.getElementById('infoCard').style.display = 'block';
}

function closeInfo() {
  document.getElementById('infoCard').style.display = 'none';
}

renderList();