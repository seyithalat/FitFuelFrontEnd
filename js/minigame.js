// Minigame Module - GYMLE Wordle Game
import { API_BASE_URL } from './api.js';

export function loadMinigamePage() {
  const container = document.getElementById('minigame-content');
  if (!container) return;

  container.innerHTML = `
    <div style="width: 100%; height: calc(100vh - 200px); min-height: 700px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-primary);">
      <iframe 
        src="${API_BASE_URL}/wordle" 
        width="100%" 
        height="100%" 
        style="border: none;" 
        title="GYMLE Wordle Game"
      ></iframe>
    </div>
  `;
}

