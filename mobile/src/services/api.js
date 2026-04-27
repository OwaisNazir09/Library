import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For Android emulator/Physical device, use your machine's LAN IP:
export const BASE_URL = "http://10.118.212.166:3245/api";

// export const BASE_URL = 'https://library-7qme.onrender.com/api';

// ─── Keys ─────────────────────────────────────────────────────────────────────
export const AUTH_TOKEN_KEY = "@lib_auth_token";
export const TENANT_ID_KEY = "@lib_tenant_id";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ─── Request Interceptor — attach token + tenant ─────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const tenantId = await AsyncStorage.getItem(TENANT_ID_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers["x-tenant-id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — unified error handling ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

// ─── Token helpers (called from authSlice) ────────────────────────────────────
export const saveAuthData = async (token, tenantId) => {
  const tasks = [AsyncStorage.setItem(AUTH_TOKEN_KEY, token)];
  if (tenantId) tasks.push(AsyncStorage.setItem(TENANT_ID_KEY, tenantId));
  await Promise.all(tasks);
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, TENANT_ID_KEY]);
};

export const loadToken = () => AsyncStorage.getItem(AUTH_TOKEN_KEY);
export const loadTenantId = () => AsyncStorage.getItem(TENANT_ID_KEY);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) =>
    api.post("/auth/signup", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMe: () => api.get("/users/me"),
  updateMe: (data) =>
    api.patch("/users/update-me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Resource API ─────────────────────────────────────────────────────────────
export const resourceApi = {
  // No auth required
  getPublicResources: (params) => api.get("/resources/public", { params }),
  // Auth required
  getAllResources: (params) => api.get("/resources", { params }),
  getResource: (id) => api.get(`/resources/${id}`),
  trackDownload: (id) => api.patch(`/resources/${id}/download`),
};

// ─── Library (Tenant) API ─────────────────────────────────────────────────────
export const libraryApi = {
  getLibraries: (params) => api.get("/tenants", { params }),
  getLibrary: (id) => api.get(`/tenants/${id}`),
  joinLibrary: (libraryId) => api.post("/tenants/join", { libraryId }),
  getMyLibraries: () => api.get("/tenants/my"),
};

export const blogApi = {
  getBlogs: (params) => api.get("/blogs", { params }),
  getBlog: (id) => api.get(`/blogs/${id}`),
  submitBlog: async (data) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const tenantId = await AsyncStorage.getItem(TENANT_ID_KEY);

    const response = await fetch(`${BASE_URL}/blogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "x-tenant-id": tenantId || "",
      },
      body: data,
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Upload failed");
    return { data: json };
  },
  addComment: (id, content) => api.post(`/blogs/${id}/comments`, { content }),
  getComments: (id) => api.get(`/blogs/${id}/comments`),
  toggleLike: (id) => api.post(`/blogs/${id}/like`),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceApi = {
  scanQR: (data) => api.post("/attendance/scan", data),
  getMyAttendance: () => api.get("/attendance/me"),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationApi = {
  getNotifications: () => api.get("/notifications"),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.patch("/users/me", data),
};

// ─── Events API ───────────────────────────────────────────────────────────────
export const eventApi = {
  getEvents: (params) => api.get("/events", { params }),
};

export default api;
