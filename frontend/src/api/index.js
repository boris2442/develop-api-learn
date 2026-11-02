// import axios from 'axios'
// import { CONFIG } from '../config/index.js'

// const apiClient = axios.create({
//   baseURL: CONFIG.API_BASE_URL,
//   headers: {
//     Accept: 'application/json',
//   },
// })
import { CONFIG } from '../config/index.js'
// export default apiClient
import axios from "axios";

const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL, // URL de ton backend Laravel
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur : Ajoute automatiquement le token à chaque requête sortante
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
