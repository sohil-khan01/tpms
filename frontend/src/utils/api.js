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
    console.log('API Call:', {
      url,
      method: config.method || 'GET',
      body: config.body,
      headers: config.headers
    });

    const response = await fetch(url, config);
    
    // Try to get response text first
    let responseText;
    try {
      responseText = await response.text();
    } catch (e) {
      responseText = 'Unable to read response';
    }

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      responseText
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If not JSON, use the text response or status text
        errorMessage = responseText || response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(responseText);
    } catch (e) {
      return responseText;
    }
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

// Members API calls
export const membersAPI = {
  getAll: async () => {
    return apiCall('/members/all');
  },

  getById: async (id) => {
    return apiCall(`/members/${id}`);
  },

  add: async (memberData) => {
    return apiCall('/members/add', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  update: async (id, memberData) => {
    return apiCall(`/members/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  delete: async (id) => {
    return apiCall(`/members/soft-delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// Error handler for API calls
export const handleAPIError = (error) => {
  console.error('API Error Details:', error);
  
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
    return `Server error: ${error.message}. Please check the backend logs and try again.`;
  } else if (error.message.includes('400')) {
    return `Bad request: ${error.message}. Please check your input data.`;
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
  membersAPI,
  handleAPIError,
};