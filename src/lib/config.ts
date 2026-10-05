const DEFAULT_BACKEND_URL = 'https://bask-backend-slo6.onrender.com';

/** Origin of the Bask backend (REST API and Socket.IO), without a trailing slash. */
export const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');

export const API_BASE_URL = `${BACKEND_URL}/api`;
