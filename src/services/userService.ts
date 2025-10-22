import api from "./api";

export interface UserDetails {
  user: {
    id: string;
    role: string;
    email?: string;
    phone: string;
    profile: Record<string, any>;
    status: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  };
  roleData: any;
  dependants: any[];
  subscriptions: any[];
  paymentHistory: any[];
}

export interface UpdateProfileRequest {
  email?: string;
  profile?: Record<string, any>;
}

/**
 * Get complete user details
 */
export const getUserDetails = async (userId: string): Promise<UserDetails> => {
  const response = await api.get(`/users/${userId}/details`);
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileRequest
): Promise<any> => {
  const response = await api.put(`/users/${userId}/profile`, data);
  return response.data;
};

export default {
  getUserDetails,
  updateUserProfile,
};
