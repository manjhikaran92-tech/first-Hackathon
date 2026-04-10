/* ===========================================================
   CityFind – Register / Add Business script
   Handles multi-step form and POSTs to /api/businesses
   =========================================================== */
const API = 'http://localhost:3000/api';

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

let selCatVal = 'Food & Dining';
let selCatTag = 'food';
function selCat(el, val) {
  document.querySelectorAll('.cat-opt').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selCatTag = val;
  selCatVal = el.querySelector('.c-nm').textContent;
}

let selPlanVal = 'Basic (Free)';
function selPlan(el) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selPlanVal = el.querySelector('.plan-name').textContent;
}

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

// ── Collect opening day/times ───────────────────────────────
function collectHours() {
  const days  = ['mon','tue','wed','thu','fri','sat','sun'];
  const btns  = document.querySelectorAll('.day-btn');
  const opens = document.querySelectorAll('.hours-row input[type=text]');
  const hours = {};
  days.forEach((d, i) => {
    const active = btns[i] && btns[i].classList.contains('active');
    hours[d] = active
      ? { open: opens[0]?.value || '', close: opens[1]?.value || '', is24h: !opens[0]?.value && !opens[1]?.value }
      : { isClosed: true };
  });
  return hours;
}

// ── Submit to API ───────────────────────────────────────────
async function submitForm() {
  const areaEl  = document.querySelector('step2 select, #step2 select');
  const phoneEl = document.querySelector('#step1 input[type=tel]');
  const emailEl = document.querySelector('#step1 input[type=email]');
  const urlEl   = document.querySelector('#step1 input[type=url]');
  const addrEl  = document.querySelector('#step2 input[type=text]');
  const pinEl   = document.querySelectorAll('#step2 input[type=text]')[1];
  const areaSelEl = document.querySelector('#step2 select');

  const payload = {
    name:        document.getElementById('bizName').value.trim(),
    category:    selCatVal,
    tag:         selCatTag,
    description: document.getElementById('bizDesc').value.trim(),
    phone:       phoneEl?.value?.trim() || '',
    email:       emailEl?.value?.trim() || '',
    website:     urlEl?.value?.trim() || '',
    address:     addrEl?.value?.trim() || '',
    area:        areaSelEl?.value?.trim() || 'Bistupur',
    pincode:     pinEl?.value?.trim() || '831001',
    hours:       collectHours(),
  };

  if (!payload.name || !payload.description) {
    alert('Please fill in the business name and description (Step 1).');
    goStep(1); return;
  }

  try {
    const res  = await fetch(`${API}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Server error');

    // Save submitted business id so dashboard can display it
    localStorage.setItem('cityfind_my_business', data.business._id);
    localStorage.setItem('cityfind_my_business_name', data.business.name);

    // Show success screen
    document.getElementById('step4').style.display   = 'none';
    document.getElementById('successScreen').style.display = 'block';
    document.getElementById('stepper').style.display = 'none';
  } catch (err) {
    alert(`Submission failed: ${err.message}. Please check that the backend is running.`);
    console.error(err);
  }
}
