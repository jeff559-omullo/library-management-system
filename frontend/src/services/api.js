import axios from "axios";

const API = axios.create({
  baseURL: "https://library-management-system-1-gd6n.onrender.com/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;