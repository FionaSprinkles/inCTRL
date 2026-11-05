/** The navbar is always visible from any page. It changes depending on if a user is logged in or
not. The navbar uses dropdown menus from Dropdown.vue component. Navbar is responsible for: -
Labeling and content inside Dropdown - Fetching from backend */

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="logo"> InCtrl </RouterLink>

      <!-- Left side of the navbar -->
      <div class="nav-left">
        <div class="nav-links">
          <!-- Dropdown component-->
          <Dropdown label="Browse" side="left">
            <div class="category-section">
              <h2>Courses by category</h2>

              <RouterLink to="/categories" class="nav-link"> All Courses </RouterLink>

              <RouterLink
                v-for="category in categories"
                :key="category.id"
                :to="`/categories/${category.slug}`"
                class="nav-link"
              >
                {{ category.name }}
              </RouterLink>
            </div>
          </Dropdown>

          <!-- Links for logged out users -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/shortcuts" class="nav-link"> Shortcuts list </RouterLink>
            <RouterLink to="/about" class="nav-link"> About </RouterLink>
          </template>

          <!-- Links for logged in users -->
          <template v-else>
            <RouterLink to="/shortcuts" class="nav-link"> Shortcuts List </RouterLink>
            <RouterLink to="/leaderboards" class="nav-link"> Leaderboards </RouterLink>
            <RouterLink to="/about" class="nav-link"> About </RouterLink>
          </template>
        </div>
      </div>

      <!-- Right side of the navbar -->
      <!-- Logged out: log in opens the modal, sign up goes to /signup -->
      <template v-if="!isLoggedIn">
        <div class="nav-right">
          <button class="nav-link btn-auth" @click="openLogin">Log in</button>
          <RouterLink to="/signup" class="nav-link btn-auth"> Sign up </RouterLink>
        </div>
      </template>

      <!-- Logged in: shows the user's username and a log out button -->
      <template v-else>
        <div class="nav-right">
          <!-- Dropdown from Dropdown.vue-->
          <Dropdown :label="username" side="right" class="user-dropdown">
            <RouterLink to="/" class="nav-link"> Home </RouterLink>
            <RouterLink to="/history" class="nav-link"> History </RouterLink>
            <button class="nav-link" @click="handleLogout">Log out</button>
          </Dropdown>
        </div>
      </template>
    </div>
  </nav>

  <!-- Visibility is controlled by the shared state in useLoginModal -->
  <LoginModal :open="showLogin" @close="closeLogin" @login="handleLogin" />
</template>

<!-- ===== SCRIPTS ======-->

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LoginModal from './LoginModal.vue'
import { useLoginModal } from '@/composables/useLoginModal'
import { useAuth } from '@/composables/useAuth'
import { login } from '@/services/authService'
import Dropdown from './Dropdown.vue'

const router = useRouter()

const { showLogin, openLogin, closeLogin } = useLoginModal() // Shared login modal state
const { isLoggedIn, username, setUser, logout } = useAuth()

// Runs when the modal emits "login"
async function handleLogin(credentials) {
  try {
    const data = await login(credentials)

    setUser(data.user)

    closeLogin()
  } catch (error) {
    alert(error.message || 'Login failed')
  }
}

// Clears the session and goes back to the home page
function handleLogout() {
  logout()
  router.push('/')
}

// This function fetches categories from backend.
// Right now categories are displayed in drop down menu.
const categories = ref([])

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories')

    if (!response.ok) {
      throw new Error('Could not fetch categories')
    }

    const data = await response.json()
    categories.value = data.categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<!-- ===== STYLE ===== -->

<style scoped>
.navbar {
  width: 100%;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 2rem; /* Samma padding (2rem) som AboutView-containern */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

/* Left and Right side of the navbar */
.nav-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

/* Logo */
.logo {
  font-size: 2.3rem;
  color: var(--color-text-white);
  text-decoration: none;
  text-align: left;
  text-shadow: 0 0 0 rgba(159, 211, 227, 0);
  transition: text-shadow 0.6s ease;
  margin-right: 2rem;
}

.logo:hover {
  text-shadow:
    0 0 15px rgba(159, 211, 227, 0.9),
    0 0 30px rgba(159, 211, 227, 0.5);
}

/* Links in nav-bar */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem; /* space between each link */
}

.nav-links > .nav-link {
  position: relative;
  letter-spacing: 1px;
  padding-bottom: 4px;
}

.nav-links > .nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-links > .nav-link:hover::after,
.nav-links > .nav-link.router-link-active::after {
  transform: scaleX(1);
}

/* Dropdown heading */
.category-section h2 {
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
  font-weight: bold;
}

/* Stacks the dropdown heading and links vertically with even spacing */
.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-section .nav-link {
  font-weight: 340;
}

/* Log in / sign up buttons */
.btn-auth {
  padding: 0.3rem 0.9rem;
  font-size: 16px;
  border-radius: 40px;

  background: linear-gradient(180deg, rgba(10, 40, 50, 0.7) 0%, rgba(10, 40, 50, 0.5) 100%);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);

  transition: all 0.3s ease;
}

/* Hover for log in / sign up buttons */
.btn-auth:hover {
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
  color: var(--color-text-main);
}

@media (max-width: 850px) {
  .navbar-inner {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1rem;
    padding: 0.75rem 1rem;
  }

  .logo {
    position: static;
    transform: none;
    width: 100%;
    text-align: center;
    order: -1;
  }

  .nav-left,
  .nav-links,
  .nav-right {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>
