<script setup>
import { RouterLink } from 'vue-router'
import {
  House,
  Bookmark,
  Compass,
  PenLine,
  TrendingUp,
  Users
} from '@lucide/vue'

defineProps({
  user: {
    type: Object,
    default: null
  }
})

const getInitials = (name) => {
  return (name || 'Utilisateur')
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}
</script>

<template>
  <aside class="hidden lg:block">
    <div class="sticky top-[146px] space-y-6">

      <!-- PROFIL -->
      <div class="flex items-center gap-3 rounded-xl p-3">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
          {{ getInitials(user?.name) }}
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">
            {{ user?.name ?? 'Bienvenue sur NEXORA' }}
          </p>
          <p class="text-xs text-text-muted">
            {{ user ? 'Mon profil' : 'Communauté NEXORA' }}
          </p>
        </div>
      </div>

      <!-- NAVIGATION -->
      <nav class="space-y-1">
        <router-link
          to="/"
          class="flex items-center gap-3 rounded-xl bg-primary-light px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary-light"
        >
          <House :size="20" />
          Fil d'actualité
        </router-link>

        <router-link
          to="/"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-primary-light hover:text-primary"
        >
          <Compass :size="20" />
          Découvrir
        </router-link>

        <router-link
          v-if="user"
          :to="{ name: 'CreateArticle' }"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-primary-light hover:text-primary"
        >
          <PenLine :size="20" />
          Créer un article
        </router-link>

        <router-link
          to="/"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-primary-light hover:text-primary"
        >
          <Bookmark :size="20" />
          Enregistrés
        </router-link>
        <router-link
         :to="{ name: 'Dashboard' }"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition hover:bg-primary-light hover:text-primary"
        >
          <Bookmark :size="20" />
          Tableau de board
        </router-link>
      </nav>

      <div class="border-t border-border pt-5">
        <p class="mb-3 px-3 text-xs font-bold tracking-wider text-text-light">
          COMMUNAUTÉ
        </p>

        <div class="space-y-1">
          <div class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-muted">
            <Users :size="20" />
            Communauté
          </div>

          <div class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-muted">
            <TrendingUp :size="20" />
            Tendances
          </div>
        </div>
      </div>

      <div class="px-3 pt-4 text-xs leading-5 text-text-light">
        <p class="font-extrabold tracking-wider text-primary">NEXORA</p>
        Une communauté de partage et de connaissances.
      </div>

    </div>
  </aside>
</template>
