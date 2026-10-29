/** The navbar is always visible from any page. It changes depending on if a user is logged in or not. 

The navbar uses dropdown menus from Dropdown.vue component. Navbar is responsible for:
- Labeling and content inside Dropdown
- Fetching from backend

*/


<template>
  <nav class="navbar">
    <RouterLink to="/" class="logo"> InCtrl </RouterLink>

    <!-- Left side of the navbar -->
    <div class="nav-left">
      <div class="nav-links">

        <!-- Dropdown component-->
        <Dropdown label="Browse" side="left">
          <div class="category-section">
            <h2>Courses by category</h2>

            <RouterLink to="/categories" class="nav-link">
              All Courses
            </RouterLink>

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

          <RouterLink to="/leaderboards" class="nav-link"> Leaderboards </RouterLink>

          <RouterLink to="/about" class="nav-link"> About </RouterLink>
        </template>

        <!-- Links for logged in users -->
        <template v-else>

          <RouterLink to="/shortcuts" class="nav-link"> Shortcuts List </RouterLink>

          <RouterLink to="/leaderboards" class="nav-link"> Leaderboards </RouterLink>
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
        <Dropdown :label="username" side="right">
          <RouterLink to="/" class="nav-link">
            Home
          </RouterLink>
          <RouterLink to="/history" class="nav-link">
            History
          </RouterLink>
          <button class="nav-link" @click="handleLogout">
            Log out
          </button>
        </Dropdown>
      </div>
    </template>
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



/* Dropdown heading */
.browse-menu h2 {
  font-size: 20px;
  letter-spacing: 2px;
  text-align: center;
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

.user {
  font-family: var(--font-display);
  font-size: 20px;
}
</style>