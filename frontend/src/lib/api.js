
import axios from 'axios';

// Backend API URL
const baseURL = (
  import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
)
  .trim()
  .replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET API ERROR MESSAGE
export const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const responseData = error.response?.data;
  const validationMessage = responseData?.errors?.[0]?.msg;

  if (!error.response) {
    return `Cannot connect to the API at ${baseURL}. Check whether your backend is running.`;
  }

  return (
    responseData?.message ||
    validationMessage ||
    fallback
  );
};

// AUTHORIZATION HEADER
export const authorizationConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// SAVE LOGIN SESSION
export const saveLoginSession = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

// CLEAR LOGIN SESSION
export const clearLoginSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export default api;
