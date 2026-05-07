export function verifyPassword(input) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  return input === adminPassword
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export function setToken(password) {
  localStorage.setItem('admin_token', btoa(password))
}

export function clearToken() {
  localStorage.removeItem('admin_token')
}

export function isAuthenticated() {
  const token = getToken()
  if (!token) return false
  try {
    const password = atob(token)
    return verifyPassword(password)
  } catch {
    return false
  }
}
