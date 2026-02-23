/**
 * API Utility for making requests to the backend
 * This ensures the app works both in development and production (Play Store)
 */
// Use expo/fetch directly to bypass the __create/polyfills.ts monkey-patch,
// which injects wrong `host` headers that re-route requests to the
// create.xyz platform instead of our real backend.
import { fetch as rawFetch } from "expo/fetch";

// Your backend base URL (NO trailing slash). Set this in apps/mobile/.env
// Example: EXPO_PUBLIC_BASE_URL=https://your-backend.com
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://tnmubuntuapp.vercel.app"
).replace(/\/$/, "");

/**
 * Make an API request to the backend
 * @param {string} endpoint - API endpoint (e.g., "/api/gallery" or "api/gallery")
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}/${cleanEndpoint}`;

  return rawFetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/**
 * Helper for GET requests
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

/**
 * Helper for POST requests
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Helper for PUT requests
 */
export async function apiPut(endpoint, data) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

// Export the base URL in case it's needed elsewhere
export { API_BASE_URL };
