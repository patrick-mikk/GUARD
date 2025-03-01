import axios from 'axios';

// Define the API base URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error handling for all requests
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Report API functions
const reportApi = {
  /**
   * Create a new report and get a response ID
   * @returns {Promise<Object>} The new report data with response_id
   */
  createReport: async () => {
    const response = await apiClient.post('/reports/');
    return response.data;
  },

  /**
   * Get an existing report by response ID
   * @param {string} responseId - The response ID
   * @returns {Promise<Object>} The report data
   */
  getReport: async (responseId) => {
    const response = await apiClient.get(`/reports/${responseId}/`);
    return response.data;
  },

  /**
   * Resume an existing report by response ID
   * @param {string} responseId - The response ID
   * @returns {Promise<Object>} The report data
   */
  resumeReport: async (responseId) => {
    const response = await apiClient.get(`/reports/${responseId}/`);
    return response.data;
  },

  /**
   * Submit the final report
   * @param {string} responseId - The response ID
   * @returns {Promise<Object>} The updated report data
   */
  submitReport: async (responseId) => {
    const response = await apiClient.post(`/reports/${responseId}/submit/`);
    return response.data;
  },

  /**
   * Update the "Before You Begin" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateBeforeYouBegin: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/before-you-begin/`, data);
    return response.data;
  },

  /**
   * Update the "Personal Info" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updatePersonalInfo: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/personal-info/`, data);
    return response.data;
  },

  /**
   * Update the "Incident Details" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateIncidentDetails: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/incident-details/`, data);
    return response.data;
  },

  /**
   * Update the "Reporting Response" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateReportingResponse: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/reporting-response/`, data);
    return response.data;
  },

  /**
   * Update the "School Response" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateSchoolResponse: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/school-response/`, data);
    return response.data;
  },

  /**
   * Update the "Impact Support" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateImpactSupport: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/impact-support/`, data);
    return response.data;
  },

  /**
   * Update the "Additional Info" section
   * @param {string} responseId - The response ID
   * @param {Object} data - The form data
   * @returns {Promise<Object>} The updated report data
   */
  updateAdditionalInfo: async (responseId, data) => {
    const response = await apiClient.patch(`/reports/${responseId}/additional-info/`, data);
    return response.data;
  }
};

export default reportApi; 