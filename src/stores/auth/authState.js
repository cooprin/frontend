export const useAuthState = () => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  permissions: JSON.parse(localStorage.getItem('permissions')) || [],
  loading: false,
})
