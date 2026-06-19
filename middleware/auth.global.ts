// Route guard: every page requires a session except the auth pages.
// Unauthenticated users are redirected to the login page.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  const isAuthRoute = to.path.startsWith('/auth')

  // Not signed in -> only auth pages are reachable.
  if (!auth.isAuthenticated && !isAuthRoute) {
    return navigateTo('/auth/login')
  }

  // Already signed in -> keep users out of the login/auth screens.
  if (auth.isAuthenticated && isAuthRoute) {
    return navigateTo('/dashboard')
  }

  // Send the bare root to the dashboard for signed-in users.
  if (auth.isAuthenticated && to.path === '/') {
    return navigateTo('/dashboard')
  }
})
