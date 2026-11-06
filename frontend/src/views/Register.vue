
<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Phone,
  LoaderCircle,
  ArrowRight,
} from "@lucide/vue";

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const handleRegister = async () => {
  try {
    await authStore.register(form.value);
    router.push({ name: "articles" });
  } catch (err) {
    console.error("Détails de l’erreur :", err.response?.data || err);
  }
};
</script>

<template>
  <main
    class="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-10"
  >
    <div class="w-full max-w-[432px]">


      <!-- Register card -->
      <section
        class="bg-surface border border-border rounded-xl shadow-md overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-5 text-center border-b border-border">
          <h1 class="text-2xl font-bold text-text-main tracking-tight">
            Créer un compte
          </h1>

          <p class="text-sm text-text-muted mt-1.5">
            Rejoignez NEXORA et partagez vos idées.
          </p>
        </div>

        <div class="p-6">

          <!-- Google -->
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3
            border border-border rounded-lg py-2.5 px-4
            text-sm font-semibold text-text-main
            hover:bg-bg hover:border-border-hover
            transition-colors duration-200"
          >
            <svg class="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 37.9 46.98 31.76 46.98 24.55z"/>
              <path fill="#FBBC05"
                d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>

            Continuer avec Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="h-px bg-border flex-1"></div>
            <span class="text-xs font-medium text-text-light">
              OU
            </span>
            <div class="h-px bg-border flex-1"></div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleRegister" class="space-y-4">

            <!-- Name -->
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">
                Nom complet
              </label>

              <div class="relative">
                <UserRound
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-light"
                />

                <input
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Votre nom complet"
                  required
                  class="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border
                  bg-surface text-text-main text-sm placeholder:text-text-light
                  outline-none transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/10"
                  :class="{
                    'border-danger focus:border-danger focus:ring-danger/10':
                      authStore.errors.name,
                  }"
                />
              </div>

              <p v-if="authStore.errors.name" class="text-xs text-danger mt-1.5">
                {{ authStore.errors.name[0] }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">
               Telephone
              </label>

              <div class="relative">
                <Phone
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-light"
                />

                <input
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="vous@exemple.com"
                  required
                  class="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border
                  bg-surface text-text-main text-sm placeholder:text-text-light
                  outline-none transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/10"
                  :class="{
                    'border-danger focus:border-danger focus:ring-danger/10':
                      authStore.errors.email,
                  }"
                />
              </div>

              <p v-if="authStore.errors.email" class="text-xs text-danger mt-1.5">
                {{ authStore.errors.email[0] }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">
                Mot de passe
              </label>

              <div class="relative">
                <LockKeyhole
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-light"
                />

                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Minimum 8 caractères"
                  required
                  class="w-full pl-11 pr-11 py-2.5 rounded-lg border border-border
                  bg-surface text-text-main text-sm placeholder:text-text-light
                  outline-none transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/10"
                  :class="{
                    'border-danger focus:border-danger focus:ring-danger/10':
                      authStore.errors.password,
                  }"
                />

                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-main transition"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  <EyeOff v-if="showPassword" class="w-[18px] h-[18px]" />
                  <Eye v-else class="w-[18px] h-[18px]" />
                </button>
              </div>

              <p v-if="authStore.errors.password" class="text-xs text-danger mt-1.5">
                {{ authStore.errors.password[0] }}
              </p>
            </div>

            <!-- Confirmation -->
            <div>
              <label class="block text-sm font-semibold text-text-main mb-1.5">
                Confirmer le mot de passe
              </label>

              <div class="relative">
                <LockKeyhole
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-light"
                />

                <input
                  v-model="form.password_confirmation"
                  :type="showPasswordConfirmation ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Répétez votre mot de passe"
                  required
                  class="w-full pl-11 pr-11 py-2.5 rounded-lg border border-border
                  bg-surface text-text-main text-sm placeholder:text-text-light
                  outline-none transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <button
                  type="button"
                  @click="showPasswordConfirmation = !showPasswordConfirmation"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text-main transition"
                  :aria-label="showPasswordConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'"
                >
                  <EyeOff v-if="showPasswordConfirmation" class="w-[18px] h-[18px]" />
                  <Eye v-else class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex items-center justify-center gap-2
              bg-primary text-white rounded-lg py-2.5 px-4
              text-sm font-semibold
              hover:bg-primary-hover
              active:scale-[0.99]
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200"
            >
              <LoaderCircle
                v-if="authStore.loading"
                class="w-5 h-5 animate-spin"
              />

              <template v-else>
                Créer mon compte
                <ArrowRight class="w-4 h-4" />
              </template>
            </button>
          </form>

          <!-- Login -->
          <div class="text-center mt-6 pt-5 border-t border-border">
            <p class="text-sm text-text-muted">
              Vous avez déjà un compte ?

              <router-link
                :to="{ name: 'Login' }"
                class="font-semibold text-primary hover:text-primary-hover hover:underline"
              >
                Se connecter
              </router-link>
            </p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <p class="text-xs text-text-light text-center mt-6">
        En créant un compte, vous acceptez de rejoindre la communauté NEXORA.
      </p>

    </div>
  </main>
</template>
