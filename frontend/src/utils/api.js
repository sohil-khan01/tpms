// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: createHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
      includeAuth: false,
    });
  },

  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  refreshToken: async () => {
    return apiCall('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Candidates API calls
export const candidatesAPI = {
  getAll: async () => {
    return apiCall('/candidates');
  },

  getById: async (id) => {
    return apiCall(`/candidates/${id}`);
  },

  uploadResume: async (formData) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/resumes/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // If response is not JSON, return success message
        return {
          success: true,
          message: 'Resume uploaded successfully',
          candidateId: Date.now(), // Fallback ID
        };
      }
    } catch (error) {
      console.error('Upload API call failed:', error);
      throw error;
    }
  },
};

// JD Matcher API calls
export const jdAPI = {
  matchCandidates: async (jdData) => {
    return apiCall('/jd/match', {
      method: 'POST',
      body: JSON.stringify(jdData),
    });
  },
};

// Messaging API calls
export const messagingAPI = {
  sendMessage: async (messageData) => {
    return apiCall('/messaging/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  getTemplates: async () => {
    return apiCall('/messaging/templates');
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: async () => {
    return apiCall('/dashboard/stats');
  },

  getRecentCandidates: async () => {
    return apiCall('/dashboard/recent-candidates');
  },
};

// Error handler for API calls
export const handleAPIError = (error) => {
  if (error.message.includes('fetch')) {
    return 'Unable to connect to server. Please check if the backend is running.';
  } else if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/';
    return 'Session expired. Please login again.';
  } else if (error.message.includes('403')) {
    return 'You do not have permission to perform this action.';
  } else if (error.message.includes('404')) {
    return 'Requested resource not found.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

export default {
  authAPI,
  candidatesAPI,
  jdAPI,
  messagingAPI,
  dashboardAPI,
  handleAPIError,
};