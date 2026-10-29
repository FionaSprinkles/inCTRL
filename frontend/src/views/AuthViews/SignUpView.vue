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
.signup-page {
  min-height: 85vh;
  display: flex;
  align-items: center; /* Centers the card vertically */
  justify-content: center; /* Centers the card horizontally */
  padding: 2rem;
}

/* Glass-card */
.glass-card {
  width: 100%; /* Takes the full available width on small screens */
  max-width: 380px; /* Never gets wider than 380px on large screens */
  padding: 1rem 2rem;
  text-align: center;

  background: rgba(255, 255, 255, 0.09); /* Makes background more transparent */
  backdrop-filter: blur(16px) saturate(160%); /* Blurs the background */
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25); /* Thin light border */
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

/* Heading spacing */
h1 {
  margin-bottom: 0.5rem;
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 18px;
  font-family: inherit;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.link-button:hover {
  color: var(--color-button-text);
}

/* Form layout */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-body);
}

/* Input fields */
input {
  padding: 8px 2px;
  background: transparent;
  border: none; /* Removes the default border on all sides */
  border-bottom: 1px solid rgba(255, 255, 255, 0.6); /* Underline for each field */
  color: white;
  outline: none; /* Removes the browser's default focus outline */
  font-family: var(--font-body);
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
  margin-top: 0.5rem;
  padding: 10px;
  background: var(--color-button);
  color: var(--color-button-text);
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Sign up button hover */
.btn-primary:hover {
  background: var(--color-button-hover);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: box-shadow 0.25s ease;
}

/* Divider with "or sign up with" text */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1.5rem 0 1rem;
  font-size: 0.8rem;
  color: var(--color-text-heading);
}

/* Two lines beside the "or sign up with" text */
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Social buttons layout*/
.social {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Social buttons design*/
.btn-social {
  padding: 8px 16px;
  background-color: #1d7874;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.25s ease; /* Smooth hover transition */
}

/* Social buttons hover */
.btn-social:hover {
  background-color: var(--color-button-hover);
  color: var(--color-button-text);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: box-shadow 0.25s ease;
}

/* Back to home link */
.back-link {
  display: block;
  margin-top: 1.5rem;
  color: var(--color-text-main);
}

/* Back to home link hover */
.back-link:hover {
  color: var(--color-button-text);
}

.error {
  color: #ff8a8a;
  font-size: 0.9rem;
  margin: 0;
}
</style>
