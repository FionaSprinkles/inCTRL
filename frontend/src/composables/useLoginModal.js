import { ref } from 'vue'

// Declared outside the function so all components share the same state
const showLogin = ref(false)

/**
 * Shared state for the login modal.
 * Lets any component (navbar, sign up page) open or close it.
 */
export function useLoginModal() {
  function openLogin() {
    showLogin.value = true
  }

  function closeLogin() {
    showLogin.value = false
  }

  return { showLogin, openLogin, closeLogin }
}
