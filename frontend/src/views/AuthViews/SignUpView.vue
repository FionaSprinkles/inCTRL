<template>
  <div class="signup-page">
    <!-- Glassmorphism card holding all content -->
    <div class="glass-card">
      <h1>Sign Up</h1>

      <!-- Link to the login modal for existing users -->
      <p class="member">
        Already a member?
        <button type="button" class="link-button" @click="goToLogin">Log in</button>
      </p>

      <!-- Sign up form. Each input is bound to a ref with v-model -->
      <form @submit.prevent="handleSubmit">
        <input
          v-model="username"
          type="text"
          placeholder="Username"
          aria-label="Username"
          autocomplete="username"
          required
        />
        <input
          v-model="firstName"
          type="text"
          placeholder="First name"
          aria-label="First name"
          autocomplete="given-name"
          required
        />
        <input
          v-model="lastName"
          type="text"
          placeholder="Last name"
          aria-label="Last name"
          autocomplete="family-name"
          required
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          aria-label="Email"
          autocomplete="email"
          required
        />
        <!-- minlength matches the backend password rule -->
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          aria-label="Password"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <!-- Error message from the backend, "Username or email already in use" -->
        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <!-- Disabled while the request is running to prevent double submits -->
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <!-- Divider text with a line on each side -->
      <div class="divider"><span>or sign up with</span></div>

      <!-- Social login buttons (no backend yet) -->
      <div class="social">
        <button type="button" class="btn-social">Google</button>
        <button type="button" class="btn-social">Apple</button>
        <button type="button" class="btn-social">Facebook</button>
      </div>

      <!-- Navigates to home page -->
      <RouterLink to="/" class="back-link">Back to home</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { register } from '@/services/authService'
import { useLoginModal } from '@/composables/useLoginModal'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { openLogin } = useLoginModal() // Shared state for the login modal in the navbar
const { setUser } = useAuth() // Shared logged-in user state

// Form field values
const username = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

const error = ref('')
const loading = ref(false)

// Go to the home page, then open the login modal
async function goToLogin() {
  await router.push('/')
  openLogin()
}

// Create the account, log the user in and go to the home page
async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const data = await register({
      username: username.value,
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    })
    setUser(data.user) // Updates the navbar right away
    router.push('/')
  } catch (err) {
    error.value = err.message // Show the error to the user
  } finally {
    loading.value = false // Always re-enable the button
  }
}
</script>

<style scoped>
/* Page layout */
.signup-page {
  display: flex;
  align-items: center; /* Centers the card vertically */
  justify-content: center; /* Centers the card horizontally */
}

/* Card layout */
.glass-card {
  width: 100%; /* Takes the full available width */
  max-width: 380px; /* Never gets wider than 380px */
  padding: 1rem 2rem;
  text-align: center;
  border-radius: 40px;

  /* Border */
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);

  /* Glassmorphism */
  backdrop-filter: saturate(120%);
  -webkit-backdrop-filter: saturate(120%);
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

/* Log in link */
.link-button {
  background: none;
  border: none;
  font-size: 18px;
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-main);
  text-decoration: underline;
  cursor: pointer;
}

/* Log in link hover */
.link-button:hover {
  color: var(--color-light-accenturate);
}

/* Form layout */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-body), sans-serif;
}

/* Input fields */
input {
  padding: 8px 2px;
  background: transparent;
  border: none; /* Removes the default border on all sides */
  border-bottom: 1px solid rgba(255, 255, 255, 0.6); /* Underline for each field */
  color: white;
  outline: none; /* Removes the browser's default focus outline */
  font-family: var(--font-body), sans-serif;
}

/* Color of the placeholder text */
input::placeholder {
  color: rgba(255, 255, 255, 0.9);
}

/* When a field is selected the underline becomes fully white */
input:focus {
  border-bottom-color: white;
}

/* Sign up button */
.btn-primary {
  background: var(--color-dark-teal);
  color: var(--color-text-white);
  letter-spacing: 5px;
  margin-top: 0.5rem;
  padding: 10px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 40px;

  /* Glassmorphism */
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

/* Sign up button hover */
.btn-primary:hover {
  color: var(--color-text-main);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

/* Divider with "or sign up with" text */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1.5rem 0 1rem;
  font-size: 0.8rem;
  color: var(--color-text-white);
}

/* Two lines beside the "or sign up with" text */
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Social buttons layout */
.social {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Social buttons design */
.btn-social {
  padding: 8px 16px;
  background-color: var(--color-dark-teal);
  color: white;
  border-radius: 40px;
  cursor: pointer;

  /* Glassmorphism */
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

/* Social buttons hover */
.btn-social:hover {
  color: var(--color-text-main);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

/* Back to home link */
.back-link {
  display: block;
  margin-top: 1.5rem;
  color: var(--color-text-main);
}

/* Back to home link hover */
.back-link:hover {
  color: var(--color-light-accenturate);
}

.error {
  color: #ff8a8a;
  font-size: 0.9rem;
  margin: 0;
}
</style>
