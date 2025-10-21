import api from './api'

export interface LoginCredentials {
  phone_or_email: string
  password: string
}

export interface RegisterData {
  role?: 'member'
  phone: string
  email?: string
  password: string
  full_name: string
  [key: string]: any
}

export interface AuthResponse {
  message: string
  user: any
  accessToken: string
  refreshToken: string
  roleData?: any
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data)
  return response.data
}

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<any> => {
  const response = await api.get('/auth/me')
  return response.data
}

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/refresh', { refreshToken })
  return response.data
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
}

