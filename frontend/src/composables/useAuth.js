import { ref, computed } from 'vue'
import { getStoredUser, getToken, getIsFirstLogin, clearSession } from '@/services/authService'

// Declared outside the function so all components share the same state.
// Restores the user from localStorage on page load if a token exists.
const user = ref(getToken() ? getStoredUser() : null)
const isFirstLogin = ref(getToken() ? getIsFirstLogin() : false)

export function useAuth() {
  const isLoggedIn = computed(() => user.value !== null)

  const username = computed(() => user.value?.username || '')

  function setUser(newUser) {
    user.value = newUser
    isFirstLogin.value = getIsFirstLogin()
  }

  function logout() {
    clearSession()
    user.value = null
    isFirstLogin.value = false
  }

  return { user, isLoggedIn, isFirstLogin, username, setUser, logout }
}
