<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useArticleStore } from '../stores/articleStore'
import SidebarLeft from '@/components/SidebarLeft.vue'
import SidebarRight from '@/components/SidebarRight.vue'

import {
  FileText,
  MessageSquare,
  Heart,
  MoreHorizontal,
  Edit3,
  Trash2,
  Camera,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from '@lucide/vue'

const authStore = useAuthStore()
const articleStore = useArticleStore()

// State du menu déroulant 3 points (stocke l'ID de l'article ouvert)
const activeDropdownId = ref(null)

// State pour la modale de suppression
const articleToDelete = ref(null)
const showDeleteModal = ref(false)

// State pour l'avatar
const avatarPreview = ref(null)
const avatarFile = ref(null)

// Filtrer uniquement les articles de l'utilisateur connecté
const myArticles = computed(() => {
  if (!authStore.user) return []
  return articleStore.articles.filter(
    article => article.user?.id === authStore.user.id
  )
})

// Calcul des statistiques
const totalComments = computed(() => {
  return myArticles.value.reduce((acc, art) => acc + (art.comments_count || 0), 0)
})

const toggleDropdown = (articleId) => {
  activeDropdownId.value = activeDropdownId.value === articleId ? null : articleId
}

// Gestion du changement de photo de profil
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
    // Ici vous pouvez déclencher l'action d'upload du store Pinia
  }
}

// Confirmation de suppression
const confirmDelete = (article) => {
  articleToDelete.value = article
  showDeleteModal.value = true
  activeDropdownId.value = null
}

const deleteArticle = async () => {
  if (articleToDelete.value) {
    await articleStore.deleteArticle(articleToDelete.value.id)
    showDeleteModal.value = false
    articleToDelete.value = null
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr))
}
</script>


<template>
  <br /><br />
 <br /><br />
  <main class="min-h-screen mt-[122px] bg-bg text-text-main">
    <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[250px_minmax(0,680px)_300px] lg:justify-center lg:gap-8 lg:px-8">

      <!-- SIDEBAR GAUCHE -->
      <SidebarLeft :user="authStore.user" />

      <!-- CONTENU PRINCIPAL -->
      <section class="min-w-0 space-y-6">

        <!-- CARTE DE PROFIL -->
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">

            <!-- PHOTO DE PROFIL -->
            <div class="relative group">
              <div class="size-24 overflow-hidden rounded-full border-2 border-primary bg-primary-light flex items-center justify-center text-2xl font-bold text-primary">

                <img
                  v-if="avatarPreview || authStore.user?.avatar"
                  :src="avatarPreview || authStore.user?.avatar"
                  :alt="authStore.user?.name"
                  class="size-full object-cover"
                />

                <span v-else>
                  {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : 'U' }}
                </span>

              </div>

              <!-- MODIFIER PHOTO -->
              <label class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Camera :size="24" class="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </label>
            </div>

            <!-- INFORMATIONS UTILISATEUR -->
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-xl font-extrabold text-text-main">
                {{ authStore.user?.name ?? 'Étudiant IUT' }}
              </h1>

              <p class="text-sm text-text-muted">
                {{ authStore.user?.email }}
              </p>

              <div class="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span class="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck :size="14" />
                  Membre Vérifié
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- STATISTIQUES -->
        <div class="grid grid-cols-3 gap-3 sm:gap-4">

          <!-- PUBLICATIONS -->
          <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm text-center">
            <div class="mx-auto flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <FileText :size="20" />
            </div>

            <p class="mt-2 text-xl font-extrabold text-text-main">
              {{ myArticles.length }}
            </p>

            <p class="text-xs text-text-muted">
              Publications
            </p>
          </div>

          <!-- COMMENTAIRES -->
          <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm text-center">
            <div class="mx-auto flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
              <MessageSquare :size="20" />
            </div>

            <p class="mt-2 text-xl font-extrabold text-text-main">
              {{ totalComments }}
            </p>

            <p class="text-xs text-text-muted">
              Commentaires
            </p>
          </div>

          <!-- J'AIME -->
          <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm text-center">
            <div class="mx-auto flex size-10 items-center justify-center rounded-full bg-danger-bg text-danger">
              <Heart :size="20" />
            </div>

            <p class="mt-2 text-xl font-extrabold text-text-main">
              0
            </p>

            <p class="text-xs text-text-muted">
              J'aime reçus
            </p>
          </div>

        </div>

        <!-- MES PUBLICATIONS -->
        <div class="space-y-4">

          <h2 class="text-lg font-bold text-text-main">
            Mes Publications
          </h2>

          <!-- AUCUNE PUBLICATION -->
          <div
            v-if="myArticles.length === 0"
            class="rounded-2xl border border-border bg-surface p-8 text-center text-text-muted"
          >
            Vous n'avez pas encore publié d'anecdote ou d'article.
          </div>

          <!-- LISTE DES PUBLICATIONS -->
          <div v-else class="space-y-4">

            <article
              v-for="article in myArticles"
              :key="article.id"
              class="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md"
            >

              <div class="flex items-center justify-between p-4 sm:p-5">

                <!-- INFORMATIONS ARTICLE -->
                <div class="min-w-0 flex-1 pr-4">

                  <div class="flex items-center gap-2 text-xs text-text-light">
                    <span>{{ formatDate(article.created_at) }}</span>

                    <span>•</span>

                    <span class="font-medium text-primary">
                      {{ article.category?.name ?? 'Général' }}
                    </span>
                  </div>

                  <h3 class="mt-1 truncate text-base font-bold text-text-main">
                    {{ article.title }}
                  </h3>

                  <p class="mt-1 line-clamp-2 text-xs text-text-muted">
                    {{ article.content }}
                  </p>

                </div>

                <!-- MENU TROIS POINTS -->
                <div class="relative shrink-0">

                  <button
                    @click.stop="toggleDropdown(article.id)"
                    class="flex size-9 items-center justify-center rounded-full text-text-muted transition hover:bg-bg hover:text-primary"
                  >
                    <MoreHorizontal :size="20" />
                  </button>

                  <!-- MENU DEROULANT -->
                  <div
                    v-if="activeDropdownId === article.id"
                    class="absolute right-0 top-10 z-30 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                  >

                    <!-- MODIFIER -->
                    <button
                      @click="$router.push({ name: 'articles.edit', params: { id: article.id } })"
                      class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-main transition hover:bg-bg"
                    >
                      <Edit3 :size="16" class="text-primary" />
                      Modifier
                    </button>

                    <!-- SUPPRIMER -->
                    <button
                      @click="confirmDelete(article)"
                      class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger-bg"
                    >
                      <Trash2 :size="16" />
                      Supprimer
                    </button>

                  </div>
                </div>

              </div>
            </article>

          </div>
        </div>

      </section>

      <!-- SIDEBAR DROITE -->
      <SidebarRight />

    </div>

    <!-- MODALE DE CONFIRMATION -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >

      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">

        <!-- TITRE MODALE -->
        <div class="flex items-center gap-3 text-danger">
          <AlertCircle :size="28" />

          <h3 class="text-lg font-bold text-text-main">
            Confirmer la suppression
          </h3>
        </div>

        <!-- MESSAGE -->
        <p class="mt-3 text-sm text-text-muted">
          Êtes-vous sûr de vouloir supprimer la publication
          <strong class="text-text-main">
            "{{ articleToDelete?.title }}"
          </strong>
          ? Cette action est irréversible.
        </p>

        <!-- ACTIONS -->
        <div class="mt-6 flex justify-end gap-3">

          <button
            @click="showDeleteModal = false"
            class="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-bg hover:text-text-main"
          >
            Annuler
          </button>

          <button
            @click="deleteArticle"
            class="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Supprimer définitivement
          </button>

        </div>
      </div>
    </div>

  </main>
</template>
