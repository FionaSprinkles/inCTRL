<!-- The navbar is always visible from any page. It changes depending on if a user is logged in or not. -->

<template>
  <nav class="navbar">
    <RouterLink to="/" class="logo"> InCtrl </RouterLink>

    <!-- Left side of the nav-bar -->

    <div class="nav-left">
      <div class="nav-links">
        <!-- Browse -->
        <!-- The browse drop down can probably be moved to a seperate component at a later stage-->

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

          <RouterLink to="/about" class="nav-link"> About </RouterLink>
        </template>

        <!-- Logged in -->

        <template v-else>
          <RouterLink to="/" class="nav-link"> Home </RouterLink>

          <RouterLink to="/courses" class="nav-link"> Courses </RouterLink>

          <RouterLink to="/quiz" class="nav-link"> Quiz </RouterLink>
        </template>
      </div>
    </div>

    <!-- Right side of the nav-bar -->

    <!-- Logged out -->

    <template v-if="!isLoggedIn">
      <div class="nav-right">
        <RouterLink to="/login" class="nav-link btn-auth"> Log in </RouterLink>
        <RouterLink to="/login" class="nav-link btn-auth"> Sign up </RouterLink>
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
</template>

<!-- ===== SCRIPTS ======-->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isBrowseOpen = ref(false)

// This is just for testing. Will change laterrr
const isLoggedIn = false

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
  align-items: center;
  position: relative;
  padding: 1rem 2rem;
  justify-content: space-between;
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
  gap: 1rem;
}

/* Logo */
.logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  color: var(--color-text-main);
  text-decoration: none;
}

/* Links in nav-bar */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: var(--color-text-main);
  background-color: transparent;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 19px;
  text-decoration: none;
  cursor: pointer;
  transition: text-shadow 0.2s ease;
}

/* Browse */
.browse {
  position: relative;
}

.nav-link:hover {
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

/* Browse dropdown */
.browse-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  width: 280px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.browse-menu h2 {
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
}

.browse-menu a {
  font-family: var(--font-body), sans-serif;
  font-size: 16px;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-auth {
  border: 1px solid #fdfbf7;
  padding: 0.3rem 0.9rem;
  font-size: 16px;
  transition: all 0.25s ease;
  border-radius: 40px;
}

.btn-auth:hover {
  background-color: var(--color-button-hover);
  color: var(--color-button-text);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
}
</style>