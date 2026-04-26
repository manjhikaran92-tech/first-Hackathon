const API_URL = 'https://cityfind-backend.onrender.com/api';

// Check already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('loginTab').className = `tab ${tab === 'login' ? 'active' : ''}`;
  document.getElementById('registerTab').className = `tab ${tab === 'register' ? 'active' : ''}`;
  hideMessages();
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('successMsg').style.display = 'none';
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
}

function hideMessages() {
  document.getElementById('errorMsg').style.display = 'none';
  document.getElementById('successMsg').style.display = 'none';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) { showError('Please fill all fields!'); return; }

  const btn = document.querySelector('#loginForm .btn-submit');
  btn.textContent = 'Logging in...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data.data));
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
      showError(data.message || 'Login failed!');
      btn.textContent = 'Login';
      btn.disabled = false;
    }
  } catch (err) {
    showError('Server error! Is backend running?');
    btn.textContent = 'Login';
    btn.disabled = false;
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !email || !password) { showError('Please fill all fields!'); return; }
  if (password.length < 6) { showError('Password must be at least 6 characters!'); return; }

  const btn = document.querySelector('#registerForm .btn-submit');
  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data.data));
      showSuccess('Account created! Redirecting...');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
      showError(data.message || 'Registration failed!');
      btn.textContent = 'Create Account';
      btn.disabled = false;
    }
  } catch (err) {
    showError('Server error! Is backend running?');
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}