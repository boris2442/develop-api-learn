import { defineStore } from "pinia";
// import { ref } from 'computed' // ou simplement ref
import { ref as vueRef } from "vue";
import apiClient from "../api/index.js";

export const useAuthStore = defineStore("auth", () => {
  const user = vueRef(null);
  const token = vueRef(localStorage.getItem("token") || null);
  const loading = vueRef(false);
  const errors = vueRef({});

  // Connexion
  const login = async (credentials) => {
    loading.value = true;
    errors.value = {};
    try {
      const response = await apiClient.post("/api/login", credentials);

      token.value = response.data.token;
      user.value = response.data.user;

      // Sauvegarde persistante du token
      localStorage.setItem("token", token.value);
      return true;
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Inscription
  const register = async (formData) => {
    loading.value = true;
    errors.value = {};
    try {
      const response = await apiClient.post("/api/register", formData);

      token.value = response.data.token;
      user.value = response.data.user;

      localStorage.setItem("token", token.value);
      return true;
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors;
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Déconnexion
  // Déconnexion
  const logout = async () => {
    try {
      // On essaie d'avertir le backend pour supprimer le token en base
      await apiClient.post("/api/logout");
    } catch (err) {
      console.warn(
        "Le serveur a refusé la déconnexion (token déjà invalide ou expiré), nettoyage local forcé.",
        err,
      );
    } finally {
      // Quoi qu'il arrive, on nettoie le front-end
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
    }
  };

  // Récupérer les infos de l'utilisateur connecté (si on recharge la page)
  const fetchUser = async () => {
    if (!token.value) return;
    try {
      const response = await apiClient.get("/api/user");
      user.value = response.data;
    } catch (err) {
      // Si le token est invalide ou expiré
      logout();
    }
  };

  return {
    user,
    token,
    loading,
    errors,
    login,
    register,
    logout,
    fetchUser,
  };
});
