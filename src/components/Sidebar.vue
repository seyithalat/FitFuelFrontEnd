<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>FitFuel</h1>
      <button class="theme-toggle" @click="$emit('toggle-theme')" title="Toggle theme">
        <span>{{ themeIcon }}</span>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a 
        v-for="item in navItems" 
        :key="item.page"
        href="#" 
        :class="['nav-item', { active: currentPage === item.page }]"
        @click.prevent="$emit('navigate', item.page)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
      <a 
        v-if="isAdmin"
        href="#" 
        :class="['nav-item', { active: currentPage === 'admin' }]"
        @click.prevent="$emit('navigate', 'admin')"
      >
        <span class="nav-icon">👑</span>
        <span>Admin</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <button class="btn-logout" @click="$emit('logout')">
        <span class="nav-icon">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    currentPage: String,
    isAdmin: Boolean
  },
  emits: ['navigate', 'logout', 'toggle-theme'],
  setup() {
    const navItems = [
      { page: 'dashboard', icon: '📊', label: 'Dashboard' },
      { page: 'workouts', icon: '💪', label: 'Workouts' },
      { page: 'meals', icon: '🍽️', label: 'Meals' },
      { page: 'calendar', icon: '📅', label: 'Calendar' },
      { page: 'preferences', icon: '⚙️', label: 'Preferences' },
      { page: 'ai', icon: '🤖', label: 'AI Tools' },
      { page: 'minigame', icon: '🎮', label: 'Minigame' }
    ]

    const themeIcon = computed(() => {
      const theme = document.documentElement.getAttribute('data-theme')
      return theme === 'dark' ? '🔆' : '🌙'
    })

    return {
      navItems,
      themeIcon
    }
  }
}
</script>
