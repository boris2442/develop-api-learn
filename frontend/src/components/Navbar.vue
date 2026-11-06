

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter, useRoute } from "vue-router";

import {
  Layers,
  Menu,
  X,
  House,
  MessageCircle,
  Bell,
  UserRound,
  LogIn,
  UserPlus,
  LogOut,
  PenLine,
} from "@lucide/vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref("");
const isDrawerOpen = ref(false);
const isProfileOpen = ref(false);

const emit = defineEmits(["search"]);

const handleSearch = () => {
  const query = searchQuery.value.trim();

  if (!query) return;

  emit("search", query);
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    closeMenus();
    await router.push({ name: "Login" });
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
  }
};

const closeMenus = () => {
  isProfileOpen.value = false;
  isDrawerOpen.value = false;
};
</script>

<template>
  <!-- NAVIGATION FIXE -->
  <header class="fixed top-0 left-0 w-full z-50 bg-surface">
    <!-- PREMIER ÉTAGE -->
    <div
      class="h-[68px] border-b border-border flex items-center justify-between px-4 md:px-8"
    >
      <!-- IDENTITÉ -->
      <router-link
        to="/"
        @click="closeMenus"
        class="flex items-center gap-2.5 shrink-0"
      >
        <div
          class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm"
        >
          <Layers :size="23" class="text-white" />
        </div>

        <span class="text-xl font-extrabold tracking-tight text-text-main">
          NEXORA
        </span>
      </router-link>

      <!-- BARRE DE RECHERCHE -->
      <form
        @submit.prevent="handleSearch"
        class="flex-1 max-w-xl mx-5 md:mx-10"
      >
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher un article, un sujet..."
          aria-label="Rechercher"
          class="w-full h-11 px-5 rounded-full bg-bg border border-transparent text-sm text-text-main placeholder:text-text-light focus:outline-none focus:border-primary focus:bg-surface transition-all duration-200"
        />
      </form>

      <!-- ACTIONS À DROITE -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- BURGER -->
        <button
          @click="
            isDrawerOpen = !isDrawerOpen;
            isProfileOpen = false;
          "
          aria-label="Ouvrir le menu"
          :aria-expanded="isDrawerOpen"
          class="tooltip-trigger relative w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light transition"
        >
          <X v-if="isDrawerOpen" :size="22" />
          <Menu v-else :size="22" />

          <span class="tooltip">Menu</span>
        </button>

        <!-- PROFIL -->
        <div class="relative">
          <button
            @click="
              isProfileOpen = !isProfileOpen;
              isDrawerOpen = false;
            "
            aria-label="Ouvrir le profil"
            :aria-expanded="isProfileOpen"
            class="tooltip-trigger relative w-10 h-10 rounded-full bg-primary-light border border-primary flex items-center justify-center hover:ring-4 hover:ring-primary-light transition"
          >
            <UserRound :size="21" class="text-primary" />

            <span class="tooltip">Profil</span>
          </button>

          <!-- MENU DÉROULANT PROFIL -->
          <Transition name="dropdown">
            <div
              v-if="isProfileOpen"
              class="absolute right-0 top-14 w-60 bg-surface border border-border rounded-xl shadow-xl p-2"
            >
              <template v-if="!authStore.token">
                <router-link
                  :to="{ name: 'Login' }"
                  @click="closeMenus"
                  class="profile-link"
                >
                  <LogIn :size="18" />
                  <span>Connexion</span>
                </router-link>

                <router-link
                  :to="{ name: 'Register' }"
                  @click="closeMenus"
                  class="profile-link"
                >
                  <UserPlus :size="18" />
                  <span>Inscription</span>
                </router-link>
              </template>

              <template v-else>
                <router-link
                  :to="{ name: 'CreateArticle' }"
                  @click="closeMenus"
                  class="profile-link"
                >
                  <PenLine :size="18" />
                  <span>Nouvel article</span>
                </router-link>

                <div class="h-px bg-border my-2"></div>

                <button
                  @click="handleLogout"
                  class="profile-link profile-link-danger w-full"
                >
                  <LogOut :size="18" />
                  <span>Déconnexion</span>
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- DEUXIÈME ÉTAGE -->
    <nav
      class="h-[54px] border-b border-border flex items-center justify-center gap-12 bg-surface"
      aria-label="Navigation principale"
    >
      <!-- ACCUEIL -->
      <router-link
        to="/"
        class="nav-icon tooltip-trigger"
        :class="{ 'nav-active': route.path === '/' }"
        aria-label="Accueil"
      >
        <House :size="23" />
        <span class="tooltip">Accueil</span>
      </router-link>

      <!-- MESSAGERIE -->
      <router-link
        to="/"
        class="nav-icon tooltip-trigger"
        :class="{ 'nav-active': route.path.startsWith('/') }"
        aria-label="Messagerie"
      >
        <MessageCircle :size="23" />
        <span class="tooltip">Messagerie</span>
      </router-link>

      <!-- NOTIFICATIONS -->
      <router-link
        to="/"
        class="nav-icon tooltip-trigger"
        :class="{ 'nav-active': route.path.startsWith('/') }"
        aria-label="Notifications"
      >
        <Bell :size="23" />
        <span class="tooltip">Notifications</span>
      </router-link>
    </nav>

    <!-- PANNEAU BURGER : VOLONTAIREMENT VIDE -->
    <Transition name="drawer">
      <div v-if="isDrawerOpen" class="fixed inset-0 top-[122px] z-40">
        <div
          class="absolute inset-0 bg-text-main/30"
          @click="isDrawerOpen = false"
        ></div>

        <aside
          class="relative w-72 h-full bg-surface border-r border-border shadow-xl"
        >
          <!-- Tu pourras ajouter tes options ici -->
        </aside>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* Icônes de navigation */
.nav-icon {
  position: relative;
  height: 54px;
  width: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.nav-icon:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.nav-active {
  color: var(--color-primary);
  border-bottom: 3px solid var(--color-primary);
}

/* Infobulles */
.tooltip-trigger {
  position: relative;
}

.tooltip {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: 6px 10px;
  border-radius: 7px;
  background: var(--color-text-main);
  color: var(--color-surface);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.18s ease;
  z-index: 100;
}

.tooltip-trigger:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Liens du profil */
.profile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.profile-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.profile-link-danger {
  color: var(--color-danger);
}

.profile-link-danger:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}

/* Mobile */
@media (max-width: 640px) {
  .nav-icon {
    width: 65px;
  }
}
</style>
