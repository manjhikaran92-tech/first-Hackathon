/* ===========================================================
   CityFind – Business Detail page script
   Reads ?id= from URL, fetches business from API,
   populates the entire page dynamically
   =========================================================== */
const API = 'http://localhost:3000/api';
const DAYS = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_LABELS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let pickedStars = 0;
let businessId  = null;

// ── Fetch business data ─────────────────────────────────────
async function loadBusiness() {
  const params = new URLSearchParams(location.search);
  businessId = params.get('id');

  if (!businessId) {
    showError('No business ID specified. Please go back to listings.');
    return;
  }

  try {
    const [bizRes, reviewsRes, nearbyRes] = await Promise.all([
      fetch(`${API}/businesses/${businessId}`),
      fetch(`${API}/businesses/${businessId}/reviews`),
      fetch(`${API}/businesses/${businessId}/nearby`),
    ]);

    if (!bizRes.ok) throw new Error(`Business not found (${bizRes.status})`);

    const { business }           = await bizRes.json();
    const { reviews, distribution } = await reviewsRes.json();
    const { businesses: nearby } = await nearbyRes.json();

    renderBusiness(business);
    renderReviews(reviews, distribution, business);
    renderNearby(nearby);
    document.title = `${business.name} – CityFind`;
  } catch (err) {
    showError(`Failed to load: ${err.message}`);
    console.error(err);
  }
}

// ── Render hero section ─────────────────────────────────────
function renderBusiness(b) {
  document.getElementById('bizIcon').textContent       = b.emoji;
  document.getElementById('bizIcon').style.background  = b.bgColor;
  document.getElementById('bizName').textContent       = `${b.name}${b.isVerified ? ' ✓' : ''}`;
  document.getElementById('bizCat').textContent        = `${b.category} · ${b.area}, Jamshedpur`;
  document.getElementById('bizRating').textContent     = b.rating || '–';
  document.getElementById('bizReviewCount').textContent = `(${b.reviewCount || 0} reviews)`;

  const statusEl = document.getElementById('bizStatus');
  statusEl.textContent  = b.isOpen ? 'Open Now' : 'Closed';
  statusEl.className    = `status-badge ${b.isOpen ? 'open' : 'closed'}`;

  if (b.isVerified) document.getElementById('bizVerified').style.display = '';

  // Call / email buttons
  const callBtn = document.getElementById('bizCallBtn');
  if (b.phone) { callBtn.href = `tel:${b.phone}`; callBtn.textContent = `📞 ${b.phone}`; }
  else { callBtn.style.display = 'none'; }

  const qaCall  = document.getElementById('qaCall');
  const qaEmail = document.getElementById('qaEmail');
  if (b.phone) {
    qaCall.textContent = `📞 Call: ${b.phone}`;
    qaCall.onclick = () => location.href = `tel:${b.phone}`;
  } else {
    qaCall.style.display = 'none';
  }
  if (b.email) {
    qaEmail.textContent = `✉️ ${b.email}`;
    qaEmail.onclick = () => location.href = `mailto:${b.email}`;
  } else {
    qaEmail.style.display = 'none';
  }

  // About / long description
  const desc = b.longDescription || b.description || '';
  document.getElementById('bizLongDesc').innerHTML = desc.replace(/\n/g, '<br>');

  // Service tags
  const tagsEl = document.getElementById('bizTags');
  if (b.serviceTags && b.serviceTags.length) {
    tagsEl.innerHTML = b.serviceTags.map(t => `<span class="tag-pill">${t}</span>`).join('');
  }

  // Opening hours
  renderHours(b.hours);

  // Contact info sidebar
  const ci = document.getElementById('contactInfo');
  if (ci) {
    ci.innerHTML = `
      <div class="contact-row"><div class="c-icon">📍</div><div class="c-val">${b.address}, ${b.area}, Jamshedpur ${b.pincode || ''}</div></div>
      ${b.phone   ? `<div class="contact-row"><div class="c-icon">📞</div><div class="c-val"><a href="tel:${b.phone}">${b.phone}</a></div></div>` : ''}
      ${b.email   ? `<div class="contact-row"><div class="c-icon">✉️</div><div class="c-val"><a href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
      ${b.website ? `<div class="contact-row"><div class="c-icon">🌐</div><div class="c-val"><a href="${b.website.startsWith('http') ? b.website : '//' + b.website}" target="_blank">${b.website}</a></div></div>` : ''}
    `;
  }
}

// ── Render hours grid ───────────────────────────────────────
function renderHours(hours) {
  const el = document.getElementById('bizHours');
  if (!hours) { el.textContent = 'Hours not available.'; return; }
  const today = new Date().getDay(); // 0=Sun … 6=Sat
  el.innerHTML = DAYS.map((d, i) => {
    const h = hours[d] || {};
    let timeStr = h.is24h ? 'Open 24 hours' : h.isClosed ? 'Closed' : (h.open && h.close) ? `${h.open} – ${h.close}` : '–';
    const label = DAY_LABELS[i] + (i === today ? ' (Today)' : '');
    return `<div class="hour-row${i === today ? ' today' : ''}"><span class="day">${label}</span><span class="time">${timeStr}</span></div>`;
  }).join('');
}

// ── Render reviews ──────────────────────────────────────────
function renderReviews(reviews, distribution, business) {
  // Rating bars
  const barsEl = document.querySelector('.r-bars');
  if (barsEl && distribution) {
    const total = distribution.reduce((s, d) => s + d.count, 0) || 1;
    barsEl.innerHTML = distribution.map(d => {
      const pct = Math.round((d.count / total) * 100);
      return `<div class="r-bar-row"><span class="r-bar-lbl">${d.stars}</span><div class="r-bar-track"><div class="r-bar-fill" style="width:${pct}%"></div></div><span class="r-bar-ct">${d.count}</span></div>`;
    }).join('');
  }

  // Big num / total
  const bigNum = document.querySelector('.r-big-num');
  const rTotal = document.querySelector('.r-total');
  if (bigNum) bigNum.textContent = business.rating || '–';
  if (rTotal) rTotal.textContent = `${business.reviewCount || 0} reviews`;

  // Review cards
  const list = document.getElementById('reviewList');
  if (!reviews || reviews.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);padding:1rem 0">No reviews yet. Be the first!</p>';
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="rv-top">
        <div class="rv-user">
          <div class="rv-avatar" style="background:${r.authorColor}">${r.authorInitials}</div>
          <div>
            <div class="rv-name">${r.authorName}</div>
            <div class="rv-date">${new Date(r.createdAt).toLocaleDateString('en-IN', { month:'long', year:'numeric' })}</div>
          </div>
        </div>
        <span class="rv-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p class="rv-text">${r.text}</p>
    </div>`).join('');
}

// ── Render nearby ───────────────────────────────────────────
function renderNearby(businesses) {
  const el = document.getElementById('nearbyList');
  if (!businesses || businesses.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No nearby businesses found.</p>';
    return;
  }
  el.innerHTML = businesses.map(b => `
    <a href="./business.html?id=${b._id}" class="nb-card">
      <div class="nb-icon" style="background:${b.bgColor}">${b.emoji}</div>
      <div class="nb-info">
        <div class="nb-name">${b.name}</div>
        <div class="nb-r">★ ${b.rating} · ${b.area}</div>
      </div>
    </a>`).join('');
}

// ── Star picker ─────────────────────────────────────────────
function pickStar(n) {
  pickedStars = n;
  const stars = document.querySelectorAll('#starPick span');
  stars.forEach((s, i) => {
    s.textContent = i < n ? '★' : '☆';
    s.style.color = i < n ? '#ef9f27' : 'inherit';
  });
}

// ── Submit review ───────────────────────────────────────────
async function submitReview() {
  const txt  = document.querySelector('.wr-textarea').value.trim();
  const name = prompt('Your name:');
  if (!name) return;
  if (!pickedStars || !txt) { alert('Please select a rating and write a review.'); return; }

  try {
    const res = await fetch(`${API}/businesses/${businessId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: name, rating: pickedStars, text: txt }),
    });
    if (!res.ok) throw new Error('Server error');
    alert('Review submitted! Thank you.');
    document.querySelector('.wr-textarea').value = '';
    pickedStars = 0; pickStar(0);
    loadBusiness(); // refresh
  } catch (err) {
    alert('Could not submit review. Please try again. ' + err.message);
  }
}

// ── Share ───────────────────────────────────────────────────
function shareLink() {
  if (navigator.share) navigator.share({ title: document.title, url: location.href });
  else { navigator.clipboard.writeText(location.href); alert('Link copied to clipboard!'); }
}

// ── Error state ─────────────────────────────────────────────
function showError(msg) {
  document.body.innerHTML = `<div style="text-align:center;padding:4rem;font-family:sans-serif">
    <div style="font-size:3rem">⚠️</div>
    <h2 style="margin:1rem 0">${msg}</h2>
    <a href="../listings/listings.html" style="color:#378add">← Back to listings</a>
  </div>`;
}

loadBusiness();
