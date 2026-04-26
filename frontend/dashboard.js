const API_URL = 'https://cityfind-backend.onrender.com/api';

// ========== PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Pehle login karo!');
    window.location.href = 'index.html';
    return;
  }

  fetchDashboardData();
});

// ========== FETCH DASHBOARD DATA ==========
async function fetchDashboardData() {
  const token = localStorage.getItem('token');

  try {
    // User info + businesses ek saath fetch karo
    const [userRes, bizRes] = await Promise.all([
      fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/businesses/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const userData = await userRes.json();
    const bizData = await bizRes.json();

    if (userRes.ok) renderUserInfo(userData.data || userData);
    if (bizRes.ok) {
      const businesses = bizData.data?.businesses || bizData.data || [];
      renderBusinesses(businesses);
      renderStats(businesses);
      renderChart(businesses);
    }

    // Reviews fetch karo
    fetchMyReviews(token);

  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ========== RENDER USER INFO ==========
function renderUserInfo(user) {
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const avatarEl = document.getElementById('userAvatar');

  if (nameEl) nameEl.textContent = user.name || 'User';
  if (emailEl) emailEl.textContent = user.email || '';
  if (avatarEl && user.avatar?.url) {
    avatarEl.src = `http://localhost:5000${user.avatar.url}`;
  }
}

// ========== RENDER STATS ==========
function renderStats(businesses) {
  const totalViews = businesses.reduce((sum, b) => sum + (b.viewCount || 0), 0);
  const totalReviews = businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
  const avgRating = businesses.length
    ? (businesses.reduce((sum, b) => sum + (b.rating?.average || 0), 0) / businesses.length).toFixed(1)
    : '0.0';

  const viewsEl = document.getElementById('totalViews');
  const reviewsEl = document.getElementById('totalReviews');
  const ratingEl = document.getElementById('avgRating');
  const bizCtEl = document.getElementById('bizCount');

  if (viewsEl) viewsEl.textContent = totalViews;
  if (reviewsEl) reviewsEl.textContent = totalReviews;
  if (ratingEl) ratingEl.textContent = avgRating;
  if (bizCtEl) bizCtEl.textContent = businesses.length;
}

// ========== RENDER CHART ==========
function renderChart(businesses) {
  const chartEl = document.getElementById('chart');
  if (!chartEl) return;

  // Agar backend se weekly data hai toh use karo
  // Warna businesses ka view data dikhao
  const chartData = businesses.length > 0
    ? businesses.slice(0, 7).map(b => ({
        day: b.name.slice(0, 3),
        val: b.viewCount || 0
      }))
    : [
        { day: 'Mon', val: 142 }, { day: 'Tue', val: 186 },
        { day: 'Wed', val: 203 }, { day: 'Thu', val: 165 },
        { day: 'Fri', val: 248 }, { day: 'Sat', val: 312 },
        { day: 'Sun', val: 192 }
      ];

  const max = Math.max(...chartData.map(d => d.val)) || 1;

  chartEl.innerHTML = chartData.map((d, i) => `
    <div class="bar-col">
      <div class="bar-val">${d.val}</div>
      <div class="bar-fill" style="height:${Math.round((d.val / max) * 100)}px;
        background:${i === 5 ? 'var(--navy)' : 'var(--blue)'}">
      </div>
      <div class="bar-lbl">${d.day}</div>
    </div>
  `).join('');
}

// ========== RENDER MY BUSINESSES ==========
function renderBusinesses(businesses) {
  const container = document.getElementById('myBusinesses');
  if (!container) return;

  if (businesses.length === 0) {
    container.innerHTML = `
      <p style="color:var(--muted);text-align:center;padding:1rem;">
        Abhi koi business nahi hai.
        <a href="register.html">Business add karo</a>
      </p>`;
    return;
  }

  container.innerHTML = businesses.map(b => `
    <div class="biz-item" style="border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong>${b.name}</strong>
          ${b.verified ? '<span class="verified">✓</span>' : ''}
          <div style="font-size:13px;color:var(--muted)">${b.categoryName} · ${b.area}</div>
        </div>
        <span class="status ${b.status === 'active' ? 'open' : 'closed'}">
          ${b.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div style="margin-top:0.5rem;font-size:13px;color:var(--muted)">
        👁️ ${b.viewCount || 0} views &nbsp;·&nbsp;
        ⭐ ${Number(b.rating?.average || 0).toFixed(1)} rating &nbsp;·&nbsp;
        💬 ${b.reviewCount || 0} reviews
      </div>
      <div style="margin-top:0.75rem;display:flex;gap:8px;">
        <a href="business.html?id=${b._id}" class="btn btn-outline" style="font-size:12px;">View</a>
        <button onclick="deleteBusiness('${b._id}')" 
          style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ========== FETCH MY REVIEWS ==========
async function fetchMyReviews(token) {
  try {
    const res = await fetch(`${API_URL}/reviews/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
  const container = document.getElementById('myReviews');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--muted)">Abhi tak koi review nahi mila.</p>';
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div class="review-item" style="border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;">
        <strong>${r.business?.name || 'Business'}</strong>
        <span style="color:#ef9f27">${getStars(r.rating)}</span>
      </div>
      <p style="font-size:13px;color:var(--muted);margin:0.5rem 0">${r.comment || ''}</p>
      <small style="color:var(--muted)">${new Date(r.createdAt).toLocaleDateString('en-IN')}</small>
      <div style="margin-top:0.5rem;">
        <button class="reply-btn" onclick="replyToReview(this, '${r._id}')">Reply to review</button>
      </div>
    </div>
  `).join('');
}

// ========== REPLY TO REVIEW ==========
function replyToReview(btn, reviewId) {
  const parentDiv = btn.parentElement;
  if (parentDiv.querySelector('.reply-input')) return;

  parentDiv.innerHTML = `
    <textarea class="reply-input" 
      style="width:100%;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:13px;font-family:var(--font-body);margin-bottom:6px;" 
      placeholder="Write a reply..."></textarea>
    <button style="background:var(--navy);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;" 
      onclick="postReply(this, '${reviewId}')">Post reply</button>
  `;
}

// ========== POST REPLY ==========
async function postReply(btn, reviewId) {
  const txt = btn.previousElementSibling.value.trim();
  if (!txt) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reply: txt })
    });

    if (res.ok) {
      alert('Reply post ho gaya! ✅');
    } else {
      alert('Reply post nahi hua!');
    }
  } catch (err) {
    console.error(err);
    alert('Server error!');
  }

  btn.parentElement.innerHTML = `
    <button class="reply-btn" onclick="replyToReview(this, '${reviewId}')">Reply to review</button>
  `;
}

// ========== DELETE BUSINESS ==========
async function deleteBusiness(id) {
  if (!confirm('Kya aap sure hain? Business delete ho jayega!')) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_URL}/businesses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      alert('Business delete ho gaya!');
      fetchDashboardData();
    } else {
      alert('Delete nahi hua!');
    }
  } catch (err) {
    console.error(err);
    alert('Server error!');
  }
}

// ========== LOGOUT ==========
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ========== HELPERS ==========
function getStars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}