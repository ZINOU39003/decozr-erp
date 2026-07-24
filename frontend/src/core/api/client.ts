// Re-export the shared API client so module repositories use the same
// base URL, auth token, and refresh logic as the rest of the app.
export { apiClient, apiClient as default } from '../../services/apiClient';
