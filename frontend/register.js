const API_URL = 'https://cityfind-backend.onrender.com/api';

// ========== STEP NAVIGATION ==========
let currentStep = 1;
const totalSteps = 4;

function goStep(n) {
  if (n < 1 || n > totalSteps) return;
  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step' + currentStep).classList.add('active');
  for (let i = 1; i <= totalSteps; i++) {
    const num = document.getElementById('sn' + i);
    const lbl = document.getElementById('sl' + i);
    if (i < n) { num.className = 'step-num done'; num.textContent = '✓'; }
    else if (i === n) { num.className = 'step-num active'; num.textContent = i; lbl.className = 'step-lbl active'; }
    else { num.className = 'step-num todo'; num.textContent = i; lbl.className = 'step-lbl'; }
  }
  if (n === 4) buildSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== SUMMARY ==========
function buildSummary() {
  const name = document.getElementById('bizName').value || 'Not entered';
  const desc = document.getElementById('bizDesc').value || 'Not entered';
  document.getElementById('reviewSummary').innerHTML = `
    <strong>Business name:</strong> ${name}<br>
    <strong>Description:</strong> ${desc}<br>
    <strong>Category:</strong> ${selCatVal || 'Food & Dining'}<br>
    <strong>Plan:</strong> ${selPlanVal || 'Basic (Free)'}
  `;
}

// ========== CATEGORY ==========
let selCatVal = 'food';
function selCat(el, val) {
  document.querySelectorAll('.cat-opt').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selCatVal = val; // backend enum value
}

// ========== PLAN ==========
let selPlanVal = 'basic';
function selPlan(el) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selPlanVal = el.querySelector('.plan-name').textContent.toLowerCase();
}

// ========== PHOTO UPLOAD ==========
function triggerUpload() { document.getElementById('photoInput').click(); }
function showPhotos(input) {
  const prev = document.getElementById('photoPreview');
  prev.innerHTML = '';
  [...input.files].slice(0, 6).forEach(f => {
    const url = URL.createObjectURL(f);
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'width:72px;height:72px;border-radius:8px;object-fit:cover;border:1px solid var(--border)';
    prev.appendChild(img);
  });
}

// ========== SUBMIT FORM - BACKEND SE CONNECT ==========
async function submitForm() {
  const token = localStorage.getItem('token');

  // Step 1 - User login check
  if (!token) {
    alert('Pehle login karo!');
    window.location.href = 'login.html';
    return;
  }

  // Form data collect karo
  const name = document.getElementById('bizName').value.trim();
  const desc = document.getElementById('bizDesc').value.trim();
  const phone = document.getElementById('bizPhone').value.trim();
  const address = document.getElementById('bizAddress').value.trim();
  const area = document.getElementById('bizArea').value;

  // Validation
  if (!name || !desc || !phone || !address || !area) {
    alert('Sab fields fill karo!');
    return;
  }

  const businessData = {
    name,
    description: desc,
    phone,
    address,
    area,
    category: selCatVal,
    plan: selPlanVal
  };

  try {
    // Submit button disable karo
    const btn = document.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'Submitting...'; btn.disabled = true; }

    const res = await fetch(`${API_URL}/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(businessData)
    });

    const data = await res.json();

    if (res.ok) {
      // Success!
      document.getElementById('step4').style.display = 'none';
      document.getElementById('successScreen').style.display = 'block';
      document.getElementById('stepper').style.display = 'none';
    } else {
      alert(data.message || 'Kuch error aaya, dobara try karo!');
      if (btn) { btn.textContent = 'Submit'; btn.disabled = false; }
    }

  } catch (err) {
    console.error(err);
    alert('Server se connect nahi ho pa raha. Backend chal raha hai?');
    const btn = document.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'Submit'; btn.disabled = false; }
  }
}

// ========== LOGIN / REGISTER USER ==========
async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || 'Login failed!');
    }
  } catch (err) {
    console.error(err);
    alert('Server error!');
  }
}

async function registerUser(name, email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || 'Register failed!');
    }
  } catch (err) {
    console.error(err);
    alert('Server error!');
  }
}