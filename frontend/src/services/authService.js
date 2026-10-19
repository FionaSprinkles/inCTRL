const TOKEN_KEY = 'inctrl_token'
const USER_KEY = 'inctrl_user'

// Saves the JWT and user object so the user stays logged in after a reload
export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Returns the saved JWT, or null if not logged in
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Returns the saved user object, or null if missing
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

// Removes the saved session (used on log out)
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || 'Something went wrong')
  }
  return body
}

// Creates a new account and saves the returned session
export async function register({ username, email, password, firstName, lastName }) {
  const data = await request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, firstName, lastName }),
  })
  saveSession(data)
  return data
}

// Logs in with email and password, then saves the session
export async function login({ email, password }) {
  const data = await request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveSession(data)
  return data
}
