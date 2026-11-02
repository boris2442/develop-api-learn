<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
    email: '',
    password: '',
});

const handleLogin = async () => {
    try {
        await authStore.login(form.value);
        router.push({ name: 'Home' });
    } catch (err) {
        console.error("Échec de la connexion", err);
    }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h1 class="text-xl font-bold text-slate-900 mb-6">Connexion</h1>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
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
          placeholder="••••••••"
          required
        />
        <span v-if="authStore.errors.password" class="text-xs text-red-500 mt-1 block">
          {{ authStore.errors.password[0] }}
        </span>
      </div>

      <!-- Bouton de soumission -->
      <button 
        type="submit"
        :disabled="authStore.loading"
        class="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {{ authStore.loading ? "Connexion en cours..." : "Se connecter" }}
      </button>
    </form>
    
    <p class="text-xs text-center text-slate-500 mt-4">
      Pas encore de compte ? 
      <router-link to="/register" class="text-indigo-600 font-semibold hover:underline">S'inscrire</router-link>
    </p>
  </div>
</template>
