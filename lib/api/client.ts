/**
 * API client for making requests to the Snagr AI API
 */

// Base API URL
const API_BASE_URL = '/api/v1';

/**
 * API client for making requests to the Snagr AI API
 */
export const apiClient = {
  /**
   * Get the authorization token from local storage
   * @returns The authorization token or null if not found
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Set the authorization token in local storage
   * @param token The authorization token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  /**
   * Clear the authorization token from local storage
   */
  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  /**
   * Make a GET request to the API
   * @param endpoint The API endpoint
   * @param params Query parameters
   * @returns The response data
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<{ data: T }> {
    const url = new URL(`${window.location.origin}${API_BASE_URL}${endpoint}`);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    // Make the request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    // Handle the response
    return this.handleResponse<T>(response);
  },

  /**
   * Make a POST request to the API
   * @param endpoint The API endpoint
   * @param data The request body
   * @returns The response data
   */
  async post<T = any>(endpoint: string, data?: any): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Handle the response
    return this.handleResponse<T>(response);
  },

  /**
   * Make a PUT request to the API
   * @param endpoint The API endpoint
   * @param data The request body
   * @returns The response data
   */
  async put<T = any>(endpoint: string, data?: any): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Make the request
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Handle the response
    return this.handleResponse<T>(response);
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint The API endpoint
   * @returns The response data
   */
  async delete<T = any>(endpoint: string): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Make the request
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    // Handle the response
    return this.handleResponse<T>(response);
  },

  /**
   * Get the headers for API requests
   * @returns The headers object
   */
  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  /**
   * Handle the API response
   * @param response The fetch response
   * @returns The response data
   * @throws Error if the response is not successful
   */
  async handleResponse<T>(response: Response): Promise<{ data: T }> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Parse the response body
    const body = isJson ? await response.json() : await response.text();
    
    // Check if the response is successful
    if (!response.ok) {
      // Handle API errors
      const error = isJson && body.error
        ? new Error(body.error.message || 'API request failed')
        : new Error('API request failed');
      
      // Add additional error properties
      if (isJson && body.error) {
        (error as any).code = body.error.code;
        (error as any).details = body.error.details;
      }
      
      (error as any).status = response.status;
      
      throw error;
    }
    
    // Return the response data
    return { data: isJson ? (body.data || body) : body };
  },
};