// Utility function to handle logout routing
const forceLogoutWithRouting = () => {
  console.log('🔄 Forcing logout with proper routing...');
  localStorage.removeItem('authToken');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('isAuthenticated');
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'isAuthenticated',
    newValue: 'false',
    oldValue: 'true'
  }));
  console.log('✅ Logout routing completed - App component will handle URL change');
};

// API Base URL from environment variable or dynamically constructed
const getAPIBaseURL = () => {
  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Otherwise, construct it from current window location
  const protocol = window.location.protocol; 
  const hostname = window.location.hostname;
  const backendPort = 2000;
  
  return `${protocol}//${hostname}:${backendPort}/api`;
};

const API_BASE_URL = getAPIBaseURL();

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

    let responseText;
    try {
      responseText = await response.text();
    } catch (e) {
      responseText = 'Unable to read response';
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = responseText || response.statusText || errorMessage;
      }

      // Skip logging for optional endpoints (like profile images that don't exist)
      const isOptionalEndpoint = endpoint.includes('/profile-image/') && response.status === 404;
      
      if (!isOptionalEndpoint) {
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/login')) {
          console.log('🚨 Session expired - forcing logout...');
          setTimeout(() => { forceLogoutWithRouting(); }, 500);
          throw new Error('Session expired. Please wait for automatic logout.');
        }

        if (response.status === 403 || errorMessage.toLowerCase().includes('forbidden')) {
          if (endpoint.includes('/auth/login') || endpoint.includes('/login')) {
            throw new Error('Account is inactive. Please contact your administrator.');
          }
          console.log('🚫 Access forbidden - user may not have required permissions');
          throw new Error('Access denied. You do not have permission to access this resource.');
        }
      }

      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      return responseText;
    }
  } catch (error) {
    // Don't log errors for optional endpoints
    const isOptionalEndpoint = endpoint.includes('/profile-image/');
    if (!isOptionalEndpoint) {
      console.error(`API call failed for ${endpoint}:`, error);
    }
    throw error;
  }
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (credentials) => {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
      includeAuth: false,
    });
  },
  logout: async () => apiCall('/auth/logout', { method: 'POST' }),
  refreshToken: async () => apiCall('/auth/refresh', { method: 'POST' }),
  checkAuthorities: async () => apiCall('/auth/debug/authorities'),
  changePassword: async (userId, currentPassword, newPassword) => apiCall('/members/change-password', {
    method: 'POST',
    body: JSON.stringify({ userId, currentPassword, newPassword }),
  }),
};

// ─── Candidates API ───────────────────────────────────────────────────────────
export const candidatesAPI = {
  getAll: async (page = 0, size = 5, sortBy = 'createdAt', sortDir = 'desc', search = '') => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return apiCall(`/candidate/all?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}${searchParam}`);
  },
  getAllUnpaged: async () => {
    const data = await apiCall(`/candidate/all?page=0&size=1000&sortBy=createdAt&sortDir=desc`);
    // /all returns a Page object; extract the content array
    return Array.isArray(data) ? data : (data?.content ?? []);
  },
  getRecent: async (limit = 3) => apiCall(`/candidate/recent/${limit}`),
  getStats: async () => apiCall('/candidate/stats'),
  getById: async (id) => apiCall(`/candidate/${id}`),
  getProfile: async (id) => apiCall(`/candidate/profile/${id}`),

  uploadResume: async (formData) => {
    const token = getAuthToken();
    // Ensure source and status have defaults if not provided
    if (!formData.get('source')) formData.append('source', 'DIRECT_APPLY');
    if (!formData.get('status')) formData.append('status', 'ACTIVE');
    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
      ? response.json()
      : { success: true, message: 'Resume uploaded successfully', candidateId: Date.now() };
  },

  addCandidateManually: async (candidateData) => {
    const token = getAuthToken();
    
    // Prepare payload matching UserProfile structure
    const payload = {
      name: candidateData.name,
      email: candidateData.email,
      phone: candidateData.phone || null,
      // Educational details from fresher registration
      collegeName: candidateData.collegeName || null,
      degree: candidateData.degree || null,
      branch: candidateData.branch || null,
      yearOfPassing: candidateData.yearOfPassing || null,
      candidateSource: candidateData.source || 'DIRECT_APPLY',
      candidateThread: candidateData.status || 'ACTIVE',
      isMember: false,
      createdAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_BASE_URL}/candidate/manual`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  uploadResumeForCandidate: async (candidateId, file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('userId', candidateId);
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/resumes/upload/data`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  uploadResumeNew: async (formData) => {
    const token = getAuthToken();
    if (!formData.get('source')) formData.append('source', 'DIRECT_APPLY');
    if (!formData.get('status')) formData.append('status', 'ACTIVE');
    const response = await fetch(`${API_BASE_URL}/resumes/new/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
      ? response.json()
      : { success: true, message: 'Resume uploaded successfully' };
  },

  downloadResume: async (candidateId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/resumes/download/${candidateId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Resume file not found' : `HTTP error! status: ${response.status}`);
    }
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'resume.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) filename = match[1];
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return { success: true, message: 'Resume downloaded successfully' };
  },

  getProfileImage: async (candidateId) => {
    // Direct fetch without using generic apiCall to avoid logging
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/resumes/profile-image/${candidateId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        // Silently return null for 404 - no logging at all
        if (response.status === 404) {
          return null;
        }
        // For other errors, still handle but don't throw
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return `${API_BASE_URL.replace('/api', '')}${data.imagePath}`;
      } else {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      // Completely silent - no console logs
      return null;
    }
  },

  uploadProfileImage: async (candidateId, file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId);

    const response = await fetch(`${API_BASE_URL}/resumes/upload-profile-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// ─── JD API ───────────────────────────────────────────────────────────────────
export const jdAPI = {
  optimize: async (data) => {
    const token = getAuthToken();
    const formData = new FormData();
    if (data.message) formData.append('message', data.message);
    if (data.file) formData.append('file', data.file);
    const response = await fetch(`${API_BASE_URL}/jd/optimize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  getAll: async () => apiCall('/jd/all'),
  getById: async (id) => apiCall(`/jd/${id}`),
  update: async (id, content) => apiCall(`/jd/${id}`, {
    method: 'PUT',
    body: content,
    headers: {
      'Content-Type': 'text/plain',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  }),
  delete: async (id) => apiCall(`/jd/${id}`, { method: 'DELETE' }),
  matchCandidates: async (jdData) => apiCall('/jd/match', {
    method: 'POST',
    body: JSON.stringify(jdData),
  }),
};

// ─── Search API ───────────────────────────────────────────────────────────────
export const searchAPI = {

  // 1. Search candidates by raw JD text → POST /candidate/by-jd-text
  byJDText: async (jdText) => {
    return apiCall('/candidate/by-jd-text', {
      method: 'POST',
      body: JSON.stringify({ jd: jdText }),
    });
  },

  // 2. Search candidates by saved JD ID → POST /candidate/by-jd-id/{jdId}
  byJDId: async (jdId) => {
    return apiCall(`/candidate/by-jd-id/${jdId}`, {
      method: 'POST',
    });
  },

  // 3. Search with filters → POST /candidate/by-jd-text/filtered
  //    body: { jd, minScore, experienceMatch, topN }
  withFilters: async ({ jd, minScore = 50, experienceMatch = null, topN = 10 }) => {
    return apiCall('/candidate/by-jd-text/filtered', {
      method: 'POST',
      body: JSON.stringify({
        jd,
        minScore,
        ...(experienceMatch && { experienceMatch }),
        topN,
      }),
    });
  },

  // 4. Score a single candidate against a JD → POST /candidate/score-candidate/{id}
  scoreCandidate: async (candidateId, jdText) => {
    return apiCall(`/candidate/score-candidate/${candidateId}`, {
      method: 'POST',
      body: JSON.stringify({ jd: jdText }),
    });
  },
};

// ─── Messaging API ────────────────────────────────────────────────────────────
export const messagingAPI = {
  sendBulkEmail: async (emailData) => apiCall('/email-templates/send-bulk', {
    method: 'POST',
    body: JSON.stringify(emailData),
  }),
  sendMessage: async (messageData) => apiCall('/messaging/send', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
  getTemplates: async () => apiCall('/email-templates/all'),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async () => apiCall('/dashboard/stats'),
  getRecentCandidates: async () => apiCall('/dashboard/recent-candidates'),
};

// ─── Members API ──────────────────────────────────────────────────────────────
export const membersAPI = {
  getAll: async () => {
    const adminUserJson = localStorage.getItem('adminUser');
    if (!adminUserJson) throw new Error('Admin user data not found in storage');
    const adminUser = JSON.parse(adminUserJson);
    return apiCall(`/members/all/${adminUser.id}`);
  },
  getById: async (id) => apiCall(`/members/${id}`),
  add: async (memberData) => apiCall('/members/add', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  update: async (id, memberData) => apiCall(`/members/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(memberData),
  }),
  delete: async (id) => apiCall(`/members/delete/${id}`, { method: 'DELETE' }),
  deactivate: async (username) => apiCall(`/auth/deactivate/${username}`, { method: 'PUT' }),
  softDelete: async (id) => apiCall(`/members/delete/${id}`, { method: 'DELETE' }),
};

// ─── Resume API ───────────────────────────────────────────────────────────────
export const resumeAPI = {
  generateCustomResume: async (candidateId, templateId, options = {}) => {
    return apiCall('/resumes/generate-custom', {
      method: 'POST',
      body: JSON.stringify({
        candidateId,
        templateId,
        includeCompanyLogo: options.includeCompanyLogo || false,
        applyBrandColors: options.applyBrandColors || false,
        includeCoverLetter: options.includeCoverLetter || false,
        includeReferences: options.includeReferences || false,
      }),
    });
  },

  sendResumeEmail: async (candidateId, resumeData) => {
    return apiCall('/resumes/send-email', {
      method: 'POST',
      body: JSON.stringify({
        candidateId,
        resumeData: {
          template: resumeData.template,
          includeCompanyLogo: resumeData.includeCompanyLogo,
          applyBrandColors: resumeData.applyBrandColors,
          includeCoverLetter: resumeData.includeCoverLetter,
          includeReferences: resumeData.includeReferences,
          candidateName: resumeData.candidateName,
          candidateEmail: resumeData.candidateEmail,
        },
      }),
    });
  },

  getResumePreview: async (candidateId, templateId) => {
    return apiCall(`/resumes/preview/${candidateId}/${templateId}`);
  },
};

// ─── Pipeline API ─────────────────────────────────────────────────────────────
export const pipelineAPI = {
  mapCandidatesToJD: async (jobId, candidateIds) => apiCall('/candidate/map-candidates-to-jd', {
    method: 'POST',
    body: JSON.stringify({ jobId, candidateIds }),
  }),
  updateStage: async (jobId, candidateId, stage) => apiCall(
    `/candidate/update-stage?jobId=${jobId}&candidateId=${candidateId}&stage=${stage}`,
    { method: 'PATCH' }
  ),
  getPipelineByJob: (jobId) => apiCall(`/candidate/pipeline/${jobId}`),
};


// ─── Setting API ─────────────────────────────────────────────────────────────
export const settingsAPI = {
  getUserSettings: async (userId) => apiCall(`/settings/${userId}`),
  saveSettings: async (settings) => apiCall('/settings/save', {
    method: 'POST',
    body: JSON.stringify(settings),
  }),
  changePassword: async (userId, currentPassword, newPassword) => apiCall('/settings/change-password', {
    method: 'POST',
    body: JSON.stringify({
      userId: userId.toString(),
      currentPassword,
      newPassword,
    }),
  }),
};

// ─── Online Test APIs ─────────────────────────────────────────────────────────
export const testCategoryAPI = {
  getAll: () => apiCall('/test-categories'),
  getById: (id) => apiCall(`/test-categories/${id}`),
  create: (data) => apiCall('/test-categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/test-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/test-categories/${id}`, { method: 'DELETE' }),
};

export const questionsAPI = {
  getAll: () => apiCall('/questions'),
  getByCategory: (categoryId) => apiCall(`/questions/category/${categoryId}`),
  getActive: () => apiCall('/questions/active'),
  create: (data) => apiCall('/questions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/questions/${id}`, { method: 'DELETE' }),
  // deactivate/activate via PUT with isActive flag
  deactivate: async (id) => {
    const q = await apiCall(`/questions/${id}`);
    return apiCall(`/questions/${id}`, { method: 'PUT', body: JSON.stringify({ ...q, isActive: false }) });
  },
  activate: async (id) => {
    const q = await apiCall(`/questions/${id}`);
    return apiCall(`/questions/${id}`, { method: 'PUT', body: JSON.stringify({ ...q, isActive: true }) });
  },
};

export const questionOptionsAPI = {
  getByQuestion: (questionId) => apiCall(`/question-options/question/${questionId}`),
  create: (data) => apiCall('/question-options', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/question-options/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/question-options/${id}`, { method: 'DELETE' }),
};

export const testCandidatesAPI = {
  getAll: () => apiCall('/testcandidates'),
  getById: (id) => apiCall(`/testcandidates/${id}`),
  create: (data) => apiCall('/testcandidates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/testcandidates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/testcandidates/${id}`, { method: 'DELETE' }),
};

export const interviewScheduleAPI = {
  getAll: () => apiCall('/interview-schedules'),
  getById: (id) => apiCall(`/interview-schedules/${id}`),
  getByCandidate: (candidateId) => apiCall(`/interview-schedules/user/${candidateId}`),
  getUpcoming: () => apiCall('/interview-schedules/upcoming'),
  getScheduled: () => apiCall('/interview-schedules/scheduled'),
  getCompleted: () => apiCall('/interview-schedules/completed'),
  create: (data) => apiCall('/interview-schedules', { method: 'POST', body: JSON.stringify(data) }),
  // Update full schedule via PUT (includes status field)
  update: (id, data) => apiCall(`/interview-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  // Status update via PATCH /interview-schedules/{id}/status?status=STATUS
  updateStatus: async (id, status) =>
    apiCall(`/interview-schedules/${id}/status?status=${status}`, { method: 'PATCH' }),
  delete: (id) => apiCall(`/interview-schedules/${id}`, { method: 'DELETE' }),
  sendTestLink: (id) => apiCall(`/interview-schedules/${id}/send-test-link`, { method: 'POST' }),
};

export const testAPI = {
  getQuestionsForInterview: (interviewId) => apiCall(`/interview-schedules/${interviewId}`),
  getQuestionsByCategory: (categoryId) => apiCall(`/test/questions/${categoryId}`),
  // NEW: Get randomized questions for interview
  getRandomizedQuestionsForInterview: (interviewId, candidateId) => 
    apiCall(`/test/questions/interview/${interviewId}/randomized?candidateId=${candidateId}`),
  submitTest: (data) => apiCall('/test/submit-test', { method: 'POST', body: JSON.stringify(data) }),
  getResult: (interviewId) => apiCall(`/test/result/${interviewId}`),
};

export const testResultsAPI = {
  getAll: () => apiCall('/test-results'),
  getById: (id) => apiCall(`/test-results/${id}`),
  getDetails: (id) => apiCall(`/test-results/${id}/details`),
  getByCandidate: (candidateId) => apiCall(`/test-results/candidate/${candidateId}`),
  getByInterview: (interviewId) => apiCall(`/test-results/interview/${interviewId}`),
  getPassed: () => apiCall('/test-results/passed'),
  getFailed: () => apiCall('/test-results/failed'),
  getTopPerformers: (limit = 10) => apiCall(`/test-results/top-performers?limit=${limit}`),
  getAverageScore: () => apiCall('/test-results/statistics/average-score'),
  getPassRate: () => apiCall('/test-results/statistics/pass-rate'),
};

// ─── Error Handler ────────────────────────────────────────────────────────────
export const handleAPIError = (error) => {
  console.error('API Error Details:', error);
  if (error.message.includes('fetch')) {
    return 'Unable to connect to server. Please check if the backend is running.';
  } else if (error.message.includes('401') || error.message.toLowerCase().includes('unauthenticated')) {
    return 'Session expired. Automatic logout in progress...';
  } else if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
    return 'Access denied. You do not have permission to perform this action.';
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
  searchAPI,
  messagingAPI,
  dashboardAPI,
  membersAPI,
  resumeAPI,
  pipelineAPI,
  settingsAPI,
  handleAPIError,
};