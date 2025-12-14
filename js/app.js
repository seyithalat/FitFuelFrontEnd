// Main App Controller - Handles navigation and page switching
import { checkAuth, logout } from './users.js';
import { loadDashboard } from './dashboard.js';
import { loadWorkoutsPage } from './workouts.js';
import { loadMealsPage } from './meals.js';
import { loadCalendarPage } from './calendar.js';
import { loadPreferencesPage } from './preferences.js';
import { loadAIPage } from './ai.js';

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Navigation
function initNavigation() {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.getAttribute('data-page');
      if (page) {
        showPage(page);
      }
    });
  });

  // Quick action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      handleQuickAction(action);
    });
  });
}

function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.add('hidden');
  });

  // Show selected page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  }

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageName) {
      item.classList.add('active');
    }
  });

  // Load page content
  switch(pageName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'workouts':
      loadWorkoutsPage();
      break;
    case 'meals':
      loadMealsPage();
      break;
    case 'calendar':
      loadCalendarPage();
      break;
    case 'preferences':
      loadPreferencesPage();
      break;
    case 'ai':
      loadAIPage();
      break;
  }
}

function handleQuickAction(action) {
  switch(action) {
    case 'create-workout':
      showPage('workouts');
      setTimeout(() => {
        document.getElementById('create-workout-btn')?.click();
      }, 100);
      break;
    case 'log-meal':
      showPage('meals');
      setTimeout(() => {
        document.getElementById('create-meal-btn')?.click();
      }, 100);
      break;
    case 'ai-workout':
      showPage('ai');
      setTimeout(() => {
        document.querySelector('[data-ai-tool="workout-plan"]')?.click();
      }, 100);
      break;
    case 'ai-recipe':
      showPage('ai');
      setTimeout(() => {
        document.querySelector('[data-ai-tool="recipes"]')?.click();
      }, 100);
      break;
    case 'calendar':
      showPage('calendar');
      break;
  }
}

// Modal Management
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = overlay?.querySelector('.modal-close');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }
}

export function showModal(title, content) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  if (overlay && modalTitle && modalBody) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    overlay.classList.remove('hidden');
  }
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Initialize App
async function init() {
  initTheme();
  initNavigation();
  initModal();

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    showLoginPage();
  });

  // Check authentication
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    showApp();
    showPage('dashboard');
  } else {
    showLoginPage();
  }
}

function showApp() {
  document.getElementById('login-page')?.classList.add('hidden');
  document.getElementById('register-page')?.classList.add('hidden');
  document.getElementById('app')?.classList.remove('hidden');
}

function showLoginPage() {
  document.getElementById('app')?.classList.add('hidden');
  document.getElementById('register-page')?.classList.add('hidden');
  document.getElementById('login-page')?.classList.remove('hidden');
}

function showRegisterPage() {
  document.getElementById('app')?.classList.add('hidden');
  document.getElementById('login-page')?.classList.add('hidden');
  document.getElementById('register-page')?.classList.remove('hidden');
}

// Export showPage for use in other modules
export { showPage };

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Make showPage available globally for other modules
window.showPage = showPage;



