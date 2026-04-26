const API_URL = 'https://cityfind-backend.onrender.com/api';

let pickedStars = 0;
let currentBusiness = null;

// ========== PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) {
    fetchBusiness(id);
    fetchReviews(id);
  }
});

// ========== FETCH BUSINESS ==========
async function fetchBusiness(id) {
  try {
    const res = await fetch(`${API_URL}/businesses/${id}`);
    const data = await res.json();
    if (res.ok) {
      currentBusiness = data.data?.business || data.data || data;
      renderBusiness(currentBusiness);
    } else {
      showError('Business not found!');
    }
  } catch (err) {
    console.error('Error:', err);
    showError('Cannot connect to server!');
  }
}

// ========== RENDER BUSINESS ==========
function renderBusiness(b) {
  document.title = `${b.name} - CityFind`;

  const bizIcon = document.getElementById('bizIcon');
  if (bizIcon) bizIcon.textContent = getCategoryEmoji(b.category);

  const bizName = document.getElementById('bizName');
  if (bizName) bizName.textContent = b.name;

  const bizCat = document.getElementById('bizCat');
  if (bizCat) bizCat.textContent = `${b.categoryName || b.category} · ${b.area}, Jamshedpur`;

  const bizStars = document.getElementById('bizStars');
  if (bizStars) bizStars.textContent = getStars(b.rating?.average || 0);

  const bizRating = document.getElementById('bizRating');
  if (bizRating) bizRating.textContent = Number(b.rating?.average || 0).toFixed(1);

  const bizReviewCt = document.getElementById('bizReviewCt');
  if (bizReviewCt) bizReviewCt.textContent = `(${b.rating?.count || 0} reviews)`;

  const bizStatus = document.getElementById('bizStatus');
  if (bizStatus) {
    bizStatus.textContent = b.isOpen ? 'Open Now' : 'Closed';
    bizStatus.className = `status-badge ${b.isOpen ? 'open' : 'closed'}`;
  }

  const bizVerified = document.getElementById('bizVerified');
  if (bizVerified) bizVerified.style.display = b.verified ? 'inline' : 'none';

  const bizDesc = document.getElementById('bizDesc');
  if (bizDesc) bizDesc.textContent = b.description;

  const bizTags = document.getElementById('bizTags');
  if (bizTags && b.services) {
    bizTags.innerHTML = b.services.map(s => `<span class="tag-pill">${s}</span>`).join('');
  }

  const bizAddr = document.getElementById('bizAddr');
  if (bizAddr) bizAddr.textContent = `${b.address}, Jamshedpur`;

  const bizPhoneLink = document.getElementById('bizPhoneLink');
  if (bizPhoneLink) {
    bizPhoneLink.textContent = b.phone;
    bizPhoneLink.href = `tel:${b.phone}`;
  }

  const bizCallBtn = document.getElementById('bizCallBtn');
  if (bizCallBtn) {
    bizCallBtn.textContent = `📞 Call: ${b.phone}`;
    bizCallBtn.onclick = () => location.href = `tel:${b.phone}`;
  }

  const bizEmail = document.getElementById('bizEmail');
  if (bizEmail) {
    if (b.email) {
      bizEmail.textContent = b.email;
      bizEmail.href = `mailto:${b.email}`;
    } else {
      bizEmail.textContent = 'Not available';
    }
  }

  const bizEmailBtn = document.getElementById('bizEmailBtn');
  if (bizEmailBtn) {
    if (b.email) bizEmailBtn.onclick = () => location.href = `mailto:${b.email}`;
  }

  const bizWebsite = document.getElementById('bizWebsite');
  if (bizWebsite) {
    if (b.website) {
      bizWebsite.textContent = b.website;
      bizWebsite.href = b.website;
      bizWebsite.target = '_blank';
    } else {
      bizWebsite.textContent = 'Not available';
    }
  }

  renderImages(b.images || []);
  renderHours(b.operatingHours);
}

// ========== RENDER IMAGES ==========
function renderImages(images) {
  const imgContainer = document.getElementById('bizImages');
  if (!imgContainer) return;
  if (images.length === 0) {
    imgContainer.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--muted)">No images available</div>';
    return;
  }
  imgContainer.innerHTML = images.map(img => `
    <img src="http://localhost:5000${img.url}"
      style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
      alt="Business image">
  `).join('');
}

// ========== RENDER HOURS ==========
function renderHours(hours) {
  const hoursEl = document.getElementById('bizHours');
  if (!hoursEl || !hours) return;

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  hoursEl.innerHTML = days.map((day, i) => {
    const h = hours[day];
    if (!h) return '';
    const isToday = i === todayIndex;
    return `
      <div class="hour-row ${isToday ? 'today' : ''}">
        <span class="day">${dayNames[i]}${isToday ? ' (Today)' : ''}</span>
        <span class="time">${h.closed ? 'Closed' : (h.open === '00:00' && h.close === '23:59' ? 'Open 24 hours' : `${h.open} - ${h.close}`)}</span>
      </div>
    `;
  }).join('');
}

// ========== FETCH REVIEWS ==========
async function fetchReviews(businessId) {
  try {
    const res = await fetch(`${API_URL}/reviews?business=${businessId}`);
    const data = await res.json();
    if (res.ok) {
      renderReviews(data.data?.reviews || data.data || []);
    }
  } catch (err) {
    console.error('Reviews error:', err);
  }
}

// ========== RENDER REVIEWS ==========
function renderReviews(reviews) {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);padding:1rem 0">No reviews yet. Be the first to review!</p>';
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="rv-top">
        <div class="rv-user">
          <div class="rv-avatar rv-avatar-1">${(r.user?.name || 'A').charAt(0).toUpperCase()}</div>
          <div>
            <div class="rv-name">${r.user?.name || 'Anonymous'}</div>
            <div class="rv-date">${new Date(r.createdAt).toLocaleDateString('en-IN', {month:'long', year:'numeric'})}</div>
          </div>
        </div>
        <span class="rv-stars">${getStars(r.rating)}</span>
      </div>
      <p class="rv-text">${r.comment || ''}</p>
    </div>
  `).join('');
}

// ========== STAR PICKER ==========
function pickStar(n) {
  pickedStars = n;
  const stars = document.querySelectorAll('#starPick span');
  stars.forEach((s, i) => {
    s.textContent = i < n ? '★' : '☆';
    s.style.color = i < n ? '#ef9f27' : 'inherit';
  });
}

// ========== SUBMIT REVIEW ==========
async function submitReview() {
  const txt = document.querySelector('.wr-textarea')?.value.trim();
  if (!pickedStars || !txt) {
    alert('Please select a rating and write a review.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to write a review!');
    return;
  }

  const params = new URLSearchParams(location.search);
  const businessId = params.get('id');

  try {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        business: businessId,
        rating: pickedStars,
        comment: txt,
        title: txt.substring(0, 50)
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Review submitted! Thank you.');
      document.querySelector('.wr-textarea').value = '';
      pickedStars = 0;
      pickStar(0);
      fetchReviews(businessId);
    } else {
      alert(data.message || 'Review not submitted!');
    }
  } catch (err) {
    console.error(err);
    alert('Server error!');
  }
}

// ========== SHARE ==========
function shareLink() {
  const name = currentBusiness?.name || 'Business';
  if (navigator.share) {
    navigator.share({ title: `${name} on CityFind`, url: location.href });
  } else {
    navigator.clipboard.writeText(location.href);
    alert('Link copied!');
  }
}

// ========== HELPERS ==========
function getCategoryEmoji(category) {
  const emojis = {
    'food':'🍽️','health':'🏥','education':'🎓','banking':'🏦',
    'shopping':'🛍️','transport':'🚗','government':'🏛️','hotel':'🏨',
    'salon':'💇','legal':'⚖️','it':'💻','other':'🏢'
  };
  return emojis[category] || '🏢';
}

function getStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function showError(msg) {
  document.body.innerHTML = `
    <div style="text-align:center;padding:4rem;">
      <h2>😕 ${msg}</h2>
      <a href="index.html">Go back home</a>
    </div>
  `;
}