<template>
  <div>
    <!-- Login Page -->
    <Login v-if="!isAuthenticated && currentView === 'login'" @login="handleLogin" @show-register="currentView = 'register'" />
    
    <!-- Register Page -->
    <Register v-if="!isAuthenticated && currentView === 'register'" @register="handleRegister" @show-login="currentView = 'login'" />
    
    <!-- Main App -->
    <div v-if="isAuthenticated" class="app-container">
      <Sidebar 
        :current-page="currentPage" 
        :is-admin="isAdminUser"
        @navigate="handleNavigate"
        @logout="handleLogout"
        @toggle-theme="toggleTheme"
      />
      <main class="main-content">
        <Dashboard v-if="currentPage === 'dashboard'" @navigate="handleNavigate" />
        <Workouts v-if="currentPage === 'workouts'" />
        <Meals v-if="currentPage === 'meals'" />
        <Calendar v-if="currentPage === 'calendar'" />
        <Preferences v-if="currentPage === 'preferences'" />
        <AI v-if="currentPage === 'ai'" />
        <Minigame v-if="currentPage === 'minigame'" />
        <Admin v-if="currentPage === 'admin' && isAdminUser" />
      </main>
    </div>
    
    <!-- Modal -->
    <Modal v-if="modal.show" :title="modal.title" @close="closeModal">
      <div v-html="modal.content"></div>
    </Modal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { getCurrentUser, isAdmin, api } from './services/api'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Sidebar from './components/Sidebar.vue'
import Dashboard from './components/Dashboard.vue'
import Workouts from './components/Workouts.vue'
import Meals from './components/Meals.vue'
import Calendar from './components/Calendar.vue'
import Preferences from './components/Preferences.vue'
import AI from './components/AI.vue'
import Minigame from './components/Minigame.vue'
import Admin from './components/Admin.vue'
import Modal from './components/Modal.vue'

export default {
  name: 'App',
  components: {
    Login,
    Register,
    Sidebar,
    Dashboard,
    Workouts,
    Meals,
    Calendar,
    Preferences,
    AI,
    Minigame,
    Admin,
    Modal
  },
  setup() {
    const isAuthenticated = ref(false)
    const currentView = ref('login')
    const currentPage = ref('dashboard')
    const modal = ref({ show: false, title: '', content: '' })

    const isAdminUser = computed(() => isAdmin())

    const checkAuth = () => {
      const user = getCurrentUser()
      isAuthenticated.value = !!user
      if (isAuthenticated.value) {
        currentView.value = 'app'
      }
    }

    const handleLogin = async (email, password) => {
      const data = await api.login(email, password)
      localStorage.setItem('token', data.token)
      isAuthenticated.value = true
      currentView.value = 'app'
      currentPage.value = 'dashboard'
    }

    const handleRegister = async (email, password) => {
      await api.register(email, password)
      // Auto-login after registration
      await handleLogin(email, password)
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      isAuthenticated.value = false
      currentView.value = 'login'
    }

    const handleNavigate = (page) => {
      currentPage.value = page
    }

    const toggleTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme')
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
    }

    const showModal = (title, content) => {
      modal.value = { show: true, title, content }
    }

    const closeModal = () => {
      modal.value = { show: false, title: '', content: '' }
    }

    // Initialize theme
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', savedTheme)
    }

    onMounted(() => {
      initTheme()
      checkAuth()
      window.showModal = showModal
      window.closeModal = closeModal
    })

    return {
      isAuthenticated,
      currentView,
      currentPage,
      modal,
      isAdminUser,
      handleLogin,
      handleRegister,
      handleLogout,
      handleNavigate,
      toggleTheme,
      showModal,
      closeModal
    }
  }
}
</script>

