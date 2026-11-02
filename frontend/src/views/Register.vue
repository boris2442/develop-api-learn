<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const handleRegister = async () => {
    try {
        await authStore.register(form.value);
        router.push({ name: 'articles' });
    } catch (err) {
        // Affiche la réponse exacte envoyée par Laravel
        console.error("Détails de l'erreur :", err.response?.data || err);
    }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h1 class="text-xl font-bold text-slate-900 mb-6">Créer un compte</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Nom -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
        <input 
          v-model="form.name"
          type="text"
          class="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Votre nom"
          required
        />
        <span v-if="authStore.errors.name" class="text-xs text-red-500 mt-1 block">
          {{ authStore.errors.name[0] }}
        </span>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Adresse email</label>
        <input 
          v-model="form.email"
          type="email"
          class="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="votre@email.com"
          required
        />
        <span v-if="authStore.errors.email" class="text-xs text-red-500 mt-1 block">
          {{ authStore.errors.email[0] }}
        </span>
      </div>

      <!-- Mot de passe -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
        <input 
          v-model="form.password"
          type="password"
          class="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Minimum 8 caractères"
          required
        />
        <span v-if="authStore.errors.password" class="text-xs text-red-500 mt-1 block">
          {{ authStore.errors.password[0] }}
        </span>
      </div>

      <!-- Confirmation du mot de passe -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
        <input 
          v-model="form.password_confirmation"
          type="password"
          class="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="Répétez le mot de passe"
          required
        />
      </div>

      <!-- Bouton de soumission -->
      <button 
        type="submit"
        :disabled="authStore.loading"
        class="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {{ authStore.loading ? "Inscription en cours..." : "S'inscrire" }}
      </button>
    </form>
    
    <p class="text-xs text-center text-slate-500 mt-4">
      Déjà un compte ? 
      <router-link         :to="{ name: 'Login' }" class="text-indigo-600 font-semibold hover:underline">Se connecter</router-link>
    </p>
  </div>
</template>
