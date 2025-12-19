# FitFuel Frontend

Frontend for my fitness tracking app. Built with vanilla JS and Vue (via CDN). Connects to a backend API for workouts, meals, and some AI features.

## Structure

Pretty straightforward setup:
- `index.html` - main page with all the HTML
- `css/style.css` - all the styling
- `js/` folder with modules:
  - `api.js` - handles all API calls
  - `users.js` - login/register stuff
  - `workouts.js` - workout tracking
  - `meals.js` - meal logging
  - `preferences.js` - user settings (uses Vue composables)
  - `ai.js` - workout plan and recipe generation
  - `admin.js` - admin panel
  - `dashboard.js`, `calendar.js`, `minigame.js` - other pages
  - `app.js` - main app controller
- `server.js` - simple Node server to run it locally

## What it does

You can track workouts (exercises, sets, reps, weight), log meals with nutritional info, set preferences like calorie targets and macros. There's also some AI features that generate workout plans based on muscle groups and meal recipes. Oh and there's a wordle game integrated from the backend.

Admin users get extra features to manage users, workouts, meals, and the exercise/food database.

## Running it

First make sure the backend is running on port 3000.

Then you can either:
- Just open `index.html` in a browser (some features might not work due to CORS)
- Use the Node server: `node server.js` then go to `http://localhost:8000`
- Or use Python: `python -m http.server 8000`
- Or VS Code Live Server extension

I usually just use the Node server since it's already set up.

## How it works

Uses ES6 modules, so everything is split into separate files. Authentication tokens are stored in localStorage. The app checks if you're logged in on load and shows the right page.

Most of it is vanilla JS, but preferences.js uses Vue composables because I wanted to try that out. The rest is just regular JS with fetch calls to the API.

The workout plan generator categorizes exercises by muscle groups (chest, back, legs, etc.) and creates proper splits like chest+triceps, back+biceps, legs+shoulders. It reads the primary_muscle field from exercises in the database.

## Tech stuff

- Vue 3 from CDN (only used in preferences)
- Vanilla JavaScript with ES6 modules
- Fetch API for backend calls
- LocalStorage for auth tokens
- Backend needs CORS enabled

