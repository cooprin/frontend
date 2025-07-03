export const useAuthState = () => ({
  token: localStorage.getItem('token') || null,
  user: null,
  userType: null,
  loading: false,
})
