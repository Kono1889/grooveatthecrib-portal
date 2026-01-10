import axios from "axios";
// Determine API base URL based on environment
const API_BASE_URL =
  import.meta.env.BACKEND_URL ||
  (import.meta.env.MODE === "production"
    ? "https://grooveatthecrib-portal-backend.onrender.com/api"
    : "http://localhost:5000/api");

console.log(`API Base URL: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000, // 70 second timeout
});

// Response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - admin token expired or invalid
      localStorage.removeItem("adminToken");
      if (window.location.pathname.includes("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Register a new user
export const registerUser = (data) => api.post("/register", data);

// Update allergy info for a user
export const updateAllergy = (id, data) =>
  api.put(`/registration/${id}/allergy`, data);

export const resendTicket = (id) =>
  api.post(`/registration/${id}/resend-ticket`);

// Admin API methods
export const adminApi = {
  getRegistrations: (params = {}) =>
    api.get("/admin/registrations", {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }),
  getAnalytics: () =>
    api.get("/admin/analytics", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }),
  sendTicket: (id) =>
    api.post(
      `/admin/registrations/${id}/send-ticket`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    ),
  sendTicketsBulk: (ids) =>
    api.post(
      "/admin/registrations/send-tickets-bulk",
      { ids },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    ),
  toggleCheckIn: (id) =>
    api.post(
      `/admin/registrations/${id}/toggle-checkin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    ),
  exportCsv: () =>
    api.get("/admin/registrations/export/csv", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      responseType: "blob",
    }),
};
