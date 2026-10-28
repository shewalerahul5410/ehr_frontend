
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

const refreshApi = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedRequestsQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("auth/token/") ||
      originalRequest.url?.includes("auth/set-password/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const response = await refreshApi.post("auth/token/refresh/", {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;

      localStorage.setItem("access_token", newAccessToken);

      if (response.data.refresh) {
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
