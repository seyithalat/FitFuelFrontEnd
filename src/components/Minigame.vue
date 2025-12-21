<template>
  <div class="page-content">
    <div class="page-header">
      <h2>Play GYMLE</h2>
      <p class="page-subtitle">Guess fitness and nutrition words!</p>
    </div>
    <div class="minigame-content">
      <div style="width: 100%; height: calc(100vh - 200px); min-height: 700px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-primary);">
        <iframe 
          :src="`${API_BASE_URL}/wordle`" 
          width="100%" 
          height="100%" 
          style="border: none;" 
          title="GYMLE Wordle Game"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { API_BASE_URL } from '../services/api'

export default {
  name: 'Minigame',
  setup() {
    return {
      API_BASE_URL
    }
  }
}
</script>
