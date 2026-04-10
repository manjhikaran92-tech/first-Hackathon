let currentStep = 1;
const totalSteps = 4;

function goStep(n) {
  if (n < 1 || n > totalSteps) return;
  document.getElementById('step' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step' + currentStep).classList.add('active');
  for (let i = 1; i <= totalSteps; i++) {
    const num = document.getElementById('sn'+i);
    const lbl = document.getElementById('sl'+i);
    if (i < n) { num.className='step-num done'; num.textContent='✓'; }
    else if (i === n) { num.className='step-num active'; num.textContent=i; lbl.className='step-lbl active'; }
    else { num.className='step-num todo'; num.textContent=i; lbl.className='step-lbl'; }
  }
  if (n === 4) buildSummary();
  window.scrollTo({top:0,behavior:'smooth'});
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
function selCat(el, val) {
  document.querySelectorAll('.cat-opt').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
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
  [...input.files].slice(0,6).forEach(f => {
    const url = URL.createObjectURL(f);
    const img = document.createElement('img');
    img.src = url; img.style.cssText = 'width:72px;height:72px;border-radius:8px;object-fit:cover;border:1px solid var(--border)';
    prev.appendChild(img);
  });
}

function submitForm() {
  document.getElementById('step4').style.display = 'none';
  document.getElementById('successScreen').style.display = 'block';
  document.getElementById('stepper').style.display = 'none';
}