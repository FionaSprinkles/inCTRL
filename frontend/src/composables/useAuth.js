import { ref, computed } from 'vue'
import { getStoredUser, getToken, clearSession } from '@/services/authService'

// Declared outside the function so all components share the same state.
// Restores the user from localStorage on page load if a token exists.
const user = ref(getToken() ? getStoredUser() : null)

export function useAuth() {
  const isLoggedIn = computed(() => user.value !== null)

  // Falls back to username for accounts without a first name
  const firstName = computed(
    () => user.value?.firstName || user.value?.displayName || user.value?.username || '',
  )

  function setUser(newUser) {
    user.value = newUser
  }

  function logout() {
    clearSession()
    user.value = null
  }

  return { user, isLoggedIn, firstName, setUser, logout }
}
