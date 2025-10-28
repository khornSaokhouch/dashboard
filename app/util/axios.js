import axios from "axios";

const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear auth store
      if (typeof window !== "undefined") {
        window.location.href = "/login"; // redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default request;
