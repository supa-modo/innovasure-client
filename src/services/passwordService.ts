import api from "./api";

export interface PasswordResetRequest {
  id_number: string;
}

export interface VerifyCodeRequest {
  id_number: string;
  code: string;
}

export interface ResetPasswordRequest {
  id_number: string;
  code: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
  valid?: boolean;
  tempPassword?: string;
  warning?: string;
}

/**
 * Request password reset code
 */
export const requestPasswordReset = async (
  data: PasswordResetRequest
): Promise<PasswordResetResponse> => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

/**
 * Verify reset code
 */
export const verifyResetCode = async (
  data: VerifyCodeRequest
): Promise<PasswordResetResponse> => {
  const response = await api.post("/auth/verify-reset-code", data);
  return response.data;
};

/**
 * Reset password with code
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<PasswordResetResponse> => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

/**
 * Change password (authenticated user)
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<PasswordResetResponse> => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};

/**
 * Admin reset password
 */
export const adminResetPassword = async (
  userId: string
): Promise<PasswordResetResponse> => {
  const response = await api.post(`/users/${userId}/admin-reset-password`);
  return response.data;
};

export default {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  changePassword,
  adminResetPassword,
};
