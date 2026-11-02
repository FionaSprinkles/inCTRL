<script setup>
import { RouterLink } from 'vue-router'
import { ref, watch, onUnmounted } from 'vue'

// "open" is controlled by the parent (navbar) and decides if the modal is visible
const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'login'])

// Form field values
const email = ref('')
const password = ref('')

// Close tab with Esc
function onKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// Clear the form whenever the modal is closed, so credentials never linger
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      email.value = ''
      password.value = ''
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

// Runs when the form is submitted
function submit() {
  emit('login', { email: email.value, password: password.value })
}
</script>

<template>
  <!-- Teleport renders the modal directly in <body> so it always appears on top of the page -->
  <Teleport to="body">
    <!-- Dark overlay. Clicking on it (but not on the card) closes the modal -->
    <div v-if="open" class="backdrop" @click.self="emit('close')">
      <!-- Glassmorphism card -->
      <div class="glass-card" role="dialog" aria-modal="true" aria-label="Log in">
        <!-- Close button in the top right corner -->
        <button class="close" aria-label="Close" @click="emit('close')">×</button>

        <h1>Log in</h1>
        <!-- Link for users without an account, navigates toward sign up page -->
        <p class="member">
          Don't have an account?
          <RouterLink to="/signup" @click="emit('close')">Sign up</RouterLink>
        </p>

        <!-- Log in form -->
        <form @submit.prevent="submit">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            aria-label="Email"
            autocomplete="email"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            aria-label="Password"
            autocomplete="current-password"
            required
          />
          <button type="submit" class="btn-primary">Log in</button>
        </form>

        <!-- Divider text with a line on each side -->
        <div class="divider"><span>or log in with</span></div>

        <!-- Social login buttons -->
        <div class="social">
          <button type="button" class="btn-social">Google</button>
          <button type="button" class="btn-social">Apple</button>
          <button type="button" class="btn-social">Facebook</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Dark overlay behind the modal */
.backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
}

/* Glass-card */
.glass-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 1rem 2rem 1.5rem;
  text-align: center;
  color: var(--color-text-main);


  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(197, 204, 214, 0.55);
  border-top-color: rgba(245, 247, 250, 0.9);
  border-radius: 20px;
  box-shadow:
    6px 12px 26px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(197, 204, 214, 0.2);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* Close button in the top right corner */
.close {
  position: absolute;
  top: 8px;
  right: 14px;
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: var(--color-text-main);
  cursor: pointer;
}

/* Heading spacing */
h1 {
  margin-bottom: 0.5rem;
}

.member a {
  font-size: 18px;
  text-decoration: underline;
}

.member a:hover {
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
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  color: white;
  outline: none;
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

/* Log in button */
.btn-primary {
  background: var(--color-dark-teal);
  color: var(--color-text-white);
  letter-spacing: 5px;
  margin-top: 0.5rem;
  padding: 10px;

  font-weight: 500;
  cursor: pointer;
  border-radius: 40px;

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

/* Log in button hover */
.btn-primary:hover {
  color: var(--color-text-main);
  box-shadow: 0 0 15px rgba(253, 251, 247, 0.4);
  transition: all 0.3s ease;
}

/* Divider with "or log in with" text */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 1.5rem 0 1rem;
  font-size: 0.8rem;
  color: var(--color-text-white);
}

/* Two lines beside the "or log in with" text */
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* Social buttons */
.social {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Social buttons design*/
.btn-social {
  padding: 8px 16px;
  background-color: var(--color-dark-teal);
  color: white;
  border-radius: 40px;
  cursor: pointer;

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
</style>
