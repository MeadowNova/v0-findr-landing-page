'use client';

import { apiInterceptor } from './interceptor';

/**
 * Fetch with authentication
 * This utility function wraps the fetch API with authentication handling
 * It automatically adds the authorization header and handles token refresh
 * 
 * @param url The URL to fetch
 * @param options The fetch options
 * @returns A promise that resolves to the fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  return apiInterceptor.fetch(url, options);
}

/**
 * Fetch JSON with authentication
 * This utility function wraps the fetch API with authentication handling and JSON parsing
 * 
 * @param url The URL to fetch
 * @param options The fetch options
 * @returns A promise that resolves to the parsed JSON response
 */
export async function fetchJsonWithAuth<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiInterceptor.fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Post JSON with authentication
 * This utility function wraps the fetch API with authentication handling and JSON parsing for POST requests
 * 
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns A promise that resolves to the parsed JSON response
 */
export async function postJsonWithAuth<T = any, D = any>(
  url: string, 
  data: D, 
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetchJsonWithAuth<T>(url, mergedOptions);
}

/**
 * Put JSON with authentication
 * This utility function wraps the fetch API with authentication handling and JSON parsing for PUT requests
 * 
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns A promise that resolves to the parsed JSON response
 */
export async function putJsonWithAuth<T = any, D = any>(
  url: string, 
  data: D, 
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetchJsonWithAuth<T>(url, mergedOptions);
}

/**
 * Delete with authentication
 * This utility function wraps the fetch API with authentication handling for DELETE requests
 * 
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns A promise that resolves to the fetch response
 */
export async function deleteWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    method: 'DELETE',
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  
  return apiInterceptor.fetch(url, mergedOptions);
}