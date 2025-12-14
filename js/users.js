// User Authentication Module
import { api, getCurrentUser } from './api.js';
import { showPage } from './app.js';

export async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const user = getCurrentUser();
    return !!user;
  } catch (error) {
    return false;
  }
}

export async function login(email, password) {
  try {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function register(email, password) {
  try {
    await api.register(email, password);
    // Auto-login after registration
    return await login(email, password);
  } catch (error) {
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  window.location.reload(); // Reload to show login page
}

// Initialize login/register forms
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value;
      const password = document.getElementById('login-password')?.value;
      const errorEl = document.getElementById('login-error');

      if (errorEl) errorEl.textContent = '';

      try {
        await login(email, password);
        window.location.reload(); // Reload to show app
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = error.message || 'Login failed';
        }
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('register-email')?.value;
      const password = document.getElementById('register-password')?.value;
      const errorEl = document.getElementById('register-error');

      if (errorEl) errorEl.textContent = '';

      try {
        await register(email, password);
        window.location.reload(); // Reload to show app
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = error.message || 'Registration failed';
        }
      }
    });
  }

  // Show register/login links
  document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-page')?.classList.add('hidden');
    document.getElementById('register-page')?.classList.remove('hidden');
  });

  document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-page')?.classList.add('hidden');
    document.getElementById('login-page')?.classList.remove('hidden');
  });
});
