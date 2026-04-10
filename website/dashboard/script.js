/* ===========================================================
   CityFind – Dashboard script
   Loads business data for the logged-in owner via localStorage.
   If no ID is stored, shows the first featured business as demo.
   =========================================================== */
const API = 'http://localhost:3000/api';

const CHART_DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CHART_VIEWS = [142, 198, 165, 210, 248, 312, 284];

async function loadDashboard() {
  const bizId   = localStorage.getItem('cityfind_my_business');
  const bizName = localStorage.getItem('cityfind_my_business_name');

  let business, reviews;

  try {
    if (bizId) {
      const [bizRes, revRes] = await Promise.all([
        fetch(`${API}/businesses/${bizId}`),
        fetch(`${API}/businesses/${bizId}/reviews?limit=5`),
      ]);
      if (bizRes.ok) {
        business = (await bizRes.json()).business;
        reviews  = (await revRes.json()).reviews;
      }
    }

    // Fallback: load first featured business for demo
    if (!business) {
      const res = await fetch(`${API}/businesses?sort=rating&limit=1`);
      const { businesses } = await res.json();
      business = businesses[0];
      const revRes = await fetch(`${API}/businesses/${business._id}/reviews?limit=5`);
      reviews = (await revRes.json()).reviews;
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    return;
  }

  renderListing(business);
  renderReviews(reviews, business);
  renderChart();
}

function renderListing(b) {
  if (!b) return;

  // Sidebar greeting
  const greeting = document.querySelector('.page-title');
  if (greeting) greeting.textContent = `Welcome to your dashboard 👋`;

  // Listing status card
  const icon = document.querySelector('.ls-icon');
  const name = document.querySelector('.ls-name');
  const stat = document.querySelector('.ls-status');
  if (icon) icon.textContent = b.emoji;
  if (name) name.textContent = b.name;
  if (stat) stat.innerHTML = `● ${b.isOpen ? 'Live' : 'Offline'} · ${b.isVerified ? 'Verified' : 'Pending verification'} · ${b.plan === 'pro' ? 'Pro plan' : 'Basic plan'}`;

  // Listing tags row
  const tagsRow = document.querySelector('[style*="border-radius:20px"]')?.parentElement;
  if (tagsRow) {
    tagsRow.innerHTML = `
      <span style="font-size:12px;background:var(--blue-lt);color:#185fa5;padding:3px 12px;border-radius:20px;">${b.category}</span>
      <span style="font-size:12px;background:${b.isOpen ? '#eaf3de' : '#fcebeb'};color:${b.isOpen ? '#3b6d11' : '#a32d2d'};padding:3px 12px;border-radius:20px;">${b.isOpen ? 'Open now' : 'Closed'}</span>
      <span style="font-size:12px;background:#faeeda;color:#854f0b;padding:3px 12px;border-radius:20px;">⭐ ${b.rating} rating</span>
      <span style="font-size:12px;background:var(--bg);color:var(--muted);padding:3px 12px;border-radius:20px;border:1px solid var(--border);">${b.reviewCount} reviews</span>
    `;
  }

  // Preview listing link
  const previewLink = document.querySelector('.btn-outline[href]');
  if (previewLink) previewLink.href = `../business/business.html?id=${b._id}`;
}

function renderReviews(reviews, business) {
  const list = document.querySelector('.review-list');
  if (!list) return;

  const viewAll = document.querySelector('.card-link[href="#"]');
  if (viewAll) viewAll.textContent = `View all ${business?.reviewCount || 0} →`;

  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);padding:1rem 0;font-size:14px;">No reviews yet.</p>';
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="rv">
      <div class="rv-head">
        <span class="rv-user">${r.authorName}</span>
        <span class="rv-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <div class="rv-text">${r.text}</div>
      <div class="rv-date">${new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
      <div class="rv-reply">
        <button class="reply-btn" onclick="this.parentElement.innerHTML='<textarea style=\\'width:100%;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:13px;font-family:var(--font-body);margin-bottom:6px;\\' placeholder=\\'Write a reply...\\'></textarea><button style=\\'background:var(--navy);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;\\'>Post reply</button>'">Reply to review</button>
      </div>
    </div>`).join('');
}

function renderChart() {
  const chart = document.getElementById('chart');
  if (!chart) return;
  const max = Math.max(...CHART_VIEWS);
  chart.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:10px;height:120px;padding:0 8px;">
      ${CHART_DAYS.map((d, i) => {
        const h = Math.round((CHART_VIEWS[i] / max) * 100);
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="font-size:10px;color:var(--muted)">${CHART_VIEWS[i]}</div>
            <div style="width:100%;background:var(--blue);border-radius:4px 4px 0 0;height:${h}%;opacity:0.85;"></div>
            <div style="font-size:11px;color:var(--muted)">${d}</div>
          </div>`;
      }).join('')}
    </div>`;
}

loadDashboard();
