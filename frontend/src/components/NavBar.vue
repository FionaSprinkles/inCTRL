<!-- The navbar is always visible from any page. It changes depending on if a user is logged in or not. -->

<template>
  <nav class="navbar">
    <RouterLink to="/" class="logo"> InCtrl </RouterLink>

    <!-- Left side of the nav-bar -->

    <div class="nav-left">
      <div class="nav-links">
        <!-- Browse -->
        <!-- The browse drop down can probably be moved to a separate component at a later stage-->

        <div class="browse">
          <!-- On click will change const isBrowseOpen -->
          <button
            class="nav-link"
            aria-controls="browse-menu"
            :aria-expanded="isBrowseOpen"
            @click="isBrowseOpen = !isBrowseOpen"
          >
            Browse
          </button>

          <!-- Browse drop-down -->

          <div v-if="isBrowseOpen" id="browse-menu" class="browse-menu">
            <div class="category-section">
              <h2>Courses by category</h2>

              <RouterLink to="/courses/windows" class="nav-link" @click="isBrowseOpen = false">
                Windows
              </RouterLink>

              <RouterLink to="/courses/office" class="nav-link" @click="isBrowseOpen = false">
                Microsoft Office
              </RouterLink>

              <RouterLink to="/courses/productivity" class="nav-link" @click="isBrowseOpen = false">
                Productivity
              </RouterLink>

              <RouterLink to="/courses/internet" class="nav-link" @click="isBrowseOpen = false">
                Internet
              </RouterLink>

              <RouterLink to="/courses/programming" class="nav-link" @click="isBrowseOpen = false">
                Programming
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Logged out -->

        <template v-if="!isLoggedIn">
          <RouterLink to="/courses" class="nav-link"> Courses </RouterLink>

          <RouterLink to="/leaderboards" class="nav-link"> Leaderboards </RouterLink>

          <RouterLink to="/about" class="nav-link"> About </RouterLink>
        </template>

        <!-- Logged in -->

        <template v-else>
          <RouterLink to="/" class="nav-link"> Home </RouterLink>

          <RouterLink to="/courses" class="nav-link"> Courses </RouterLink>

          <RouterLink to="/quiz" class="nav-link"> Quiz </RouterLink>

          <RouterLink to="/history" class="nav-link"> History </RouterLink>

          <RouterLink to="/shortcuts" class="nav-link"> Shortcuts List </RouterLink>

          <RouterLink to="/leaderboards" class="nav-link"> Leaderboards </RouterLink>
        </template>
      </div>
    </div>

    <!-- Right side of the nav-bar -->

    <!-- Logged out -->

    <template v-if="!isLoggedIn">
      <div class="nav-right">
        <button class="nav-link btn-auth" @click="showLogin = true">Log in</button>
        <RouterLink to="/signup" class="nav-link btn-auth"> Sign up </RouterLink>
      </div>
    </template>

    <!-- Logged in -->

    <template v-else>
      <div class="nav-right">
        <!-- Change this later -->

        <div class="user">Fiona</div>

        <RouterLink to="/log-out" class="nav-link"> Log out </RouterLink>
      </div>
    </template>
  </nav>

  <LoginModal :open="showLogin" @close="showLogin = false" @login="handleLogin" />
</template>

<!-- ===== SCRIPTS ======-->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LoginModal from './LoginModal.vue'

const isBrowseOpen = ref(false)
const showLogin = ref(false)

// This is just for testing. Will change later.
const isLoggedIn = true

function handleLogin(credentials) {
  showLogin.value = false
}

// This function makes the browse drop down disappear when clicking elsewhere
function closeBrowse(event) {
  if (!event.target.closest('.browse')) {
    isBrowseOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', closeBrowse)
})
onUnmounted(() => {
  document.removeEventListener('click', closeBrowse)
})
</script>

<!-- ===== STYLE ===== -->

<style scoped>
.navbar {
  display: flex;
  align-items: center; /* vertically centers all items in the bar */
  position: relative;
  padding: 1rem 2rem; /* 1rem top/bottom, 2rem left/right so content doesn't touch the edges */
  justify-content: space-between; /* pushes .nav-left and .nav-right to opposite ends */
}

/* Left and Right side of the navbar */
.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem; /* space between Log in and Sign up */
}

/* Logo */
.logo {
  position: absolute;
  left: 50%; /* start at middle of navbar */
  transform: translateX(-50%); /* shift back half its width to center */
  font-size: 2rem;
  color: var(--color-text-main);
  text-decoration: none; /* no underline */
}

/* Links in nav-bar */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem; /* space between each link */
}

.nav-link {
  color: var(--color-text-main);
  background-color: transparent; /* removes the default grey button background */
  border: none; /* removes the default button border */
  padding: 0.8rem 1rem;
  font-size: 19px;
  text-decoration: none;
  cursor: pointer; /* hand cursor, buttons don't get this by default */
  transition: text-shadow 0.2s ease; /* Smooth hover transition for glow effect */
}

.nav-link:hover {
  color: var(--color-text-muted);
  transition: color 0.2s ease; /* Smooth hover transition */
}

/* Browse */
.browse {
  position: relative;
}

/* Browse dropdown */
.browse-menu {
  position: absolute;
  top: 100%; /* starts right below the Browse button */
  left: 0;
  z-index: 10; /* stays on top of other elements */
  width: 280px;
  padding: 1rem;

  /* Glass effect for the dropdown */
  background: rgba(255, 255, 255, 0.12); /* Semi-transparent white background */
  backdrop-filter: blur(16px) saturate(160%); /* Blurs background and boosts color saturation */
  -webkit-backdrop-filter: blur(16px) saturate(160%); /* Safari support for backdrop filter */
  border: 1px solid rgba(255, 255, 255, 0.25); /* Subtle light border for glass edge */
  border-radius: 20px; /* Rounded corners */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); /* Soft shado% */
}

/* Dropdown heading */
.browse-menu h2 {
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
}

/* Smaller font for links inside the dropdown */
.browse-menu a {
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
}

/* Stacks the dropdown heading and links vertically with even spacing */
.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Log in / sign up buttons */
.btn-auth {
  border: 1px solid #fdfbf7;
  padding: 0.3rem 0.9rem;
  font-size: 16px;
  transition: all 0.25s ease; /* Smooth hover transition */
  border-radius: 40px;
  background-color: #1d7874;
}

/* Hover for log in / sign up buttons */
.btn-auth:hover {
  background-color: var(--color-button-hover);
  color: var(--color-button-text);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
}
</style>