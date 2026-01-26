import axios from "axios";

const axiosInstance = axios.create({
  
  baseURL: "https://localhost:8008",
  headers: {
    "Content-Type": "application/json",
  },
});

//Automatically add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("error checkpoint 1");
  return config;
});

export default axiosInstance;
