/**
 * User related type definitions
 */

// Base user interface
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}

// User registration request
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password update request
export interface PasswordUpdateRequest {
  password: string;
  token?: string;
}

// User profile update request
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
}