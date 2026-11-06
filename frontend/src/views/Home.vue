
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useArticleStore } from '../stores/articleStore.js'
import { useAuthStore } from '../stores/authStore'

import {
  House,
  UserRound,
  Bookmark,
  Compass,
  PenLine,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Search,
  LoaderCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Image as ImageIcon
} from '@lucide/vue'

const articleStore = useArticleStore()
const authStore = useAuthStore()
const router = useRouter()

const {
  articles,
  loading,
  loadingMore,
  error,
  currentPage,
  lastPage
} = storeToRefs(articleStore)

const observerTarget = ref(null)
const searchQuery = ref('')
const likedArticles = ref(new Set())
const observer = ref(null)

const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return articles.value

  return articles.value.filter(article =>
    `${article.title} ${article.content} ${article.user?.name ?? ''}`
      .toLowerCase()
      .includes(query)
  )
})

const toggleLike = (id) => {
  const updated = new Set(likedArticles.value)

  if (updated.has(id)) {
    updated.delete(id)
  } else {
    updated.add(id)
  }

  likedArticles.value = updated
}

const openArticle = (article) => {
  router.push({
    name: 'articles.show',
    params: { slug: article.slug }
  })
}

const loadMore = async () => {
  if (
    loading.value ||
    loadingMore.value ||
    currentPage.value >= lastPage.value ||
    !articles.value.length
  ) return

  await articleStore.fetchArticles(currentPage.value + 1)
}

const refreshFeed = async () => {
  searchQuery.value = ''
  await articleStore.refreshArticles()
}

const formatDate = (date) => {
  if (!date) return ''

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate)
}

const getInitials = (name) => {
  return (name || 'Utilisateur')
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }

  if (!articles.value.length) {
    await articleStore.fetchArticles()
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    {
      root: null,
      rootMargin: '300px',
      threshold: 0
    }
  )

  if (observerTarget.value) {
    observer.value.observe(observerTarget.value)
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<template>
  <main class="min-h-screen mt-[122px] bg-bg text-text-main">

    <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[250px_minmax(0,680px)] lg:justify-center lg:gap-8 lg:px-8">

      <!-- SIDEBAR -->
      <aside class="hidden lg:block">
        <div class="sticky top-[146px] space-y-6">

          <!-- PROFIL -->
          <div class="flex items-center gap-3 rounded-xl p-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
              {{ getInitials(authStore.user?.name) }}
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">
                {{ authStore.user?.name ?? 'Bienvenue sur NEXORA' }}
              </p>
              <p class="text-xs text-text-muted">
                {{ authStore.user ? 'Mon profil' : 'Communauté NEXORA' }}
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
              v-if="authStore.user"
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


      <!-- FEED -->
      <section class="min-w-0">

        <!-- HEADER -->
        <div class="mb-6 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold tracking-widest text-primary">
              VOTRE COMMUNAUTÉ
            </p>

            <h1 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Fil d'actualité
            </h1>

            <p class="mt-1 text-sm text-text-muted">
              Découvrez les publications de la communauté.
            </p>
          </div>

          <button
            @click="refreshFeed"
            :disabled="loading || loadingMore"
            class="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw :size="18" />
          </button>
        </div>


        <!-- CREATE POST -->
        <div
          v-if="authStore.user"
          class="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
              {{ getInitials(authStore.user.name) }}
            </div>

            <button
              @click="router.push({ name: 'CreateArticle' })"
              class="flex-1 rounded-full bg-bg px-5 py-3 text-left text-sm text-text-muted transition hover:bg-primary-light"
            >
              Quoi de neuf aujourd'hui ?
            </button>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-border pt-3">
            <button
              @click="router.push({ name: 'CreateArticle' })"
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-success transition hover:bg-bg"
            >
              <ImageIcon :size="19" />
              Photo / Article
            </button>

            <router-link
              :to="{ name: 'CreateArticle' }"
              class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <PenLine :size="17" />
              Publier
            </router-link>
          </div>
        </div>


        <!-- SEARCH -->
        <div class="mb-5 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
          <Search :size="19" class="shrink-0 text-text-muted" />

          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher une publication..."
            class="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-light"
          />
        </div>


        <!-- INITIAL LOADING -->
        <div
          v-if="loading && !articles.length"
          class="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16"
        >
          <LoaderCircle :size="30" class="animate-spin text-primary" />
          <p class="text-sm text-text-muted">
            Chargement des publications...
          </p>
        </div>


        <!-- ERROR -->
        <div
          v-else-if="error && !articles.length"
          class="rounded-xl border border-danger/30 bg-danger-bg p-5 text-sm text-danger"
        >
          <p>{{ error }}</p>

          <button
            @click="refreshFeed"
            class="mt-3 font-semibold underline"
          >
            Réessayer
          </button>
        </div>


        <template v-else>

          <!-- EMPTY STATE -->
          <div
            v-if="filteredArticles.length === 0"
            class="flex flex-col items-center rounded-2xl border border-border bg-surface px-5 py-16 text-center shadow-sm"
          >
            <Search :size="32" class="mb-3 text-text-light" />

            <h2 class="font-bold">
              {{ searchQuery ? 'Aucun résultat' : 'Aucune publication' }}
            </h2>

            <p class="mt-2 text-sm text-text-muted">
              {{
                searchQuery
                  ? 'Essayez avec un autre mot-clé.'
                  : 'Soyez le premier à partager une idée.'
              }}
            </p>
          </div>


          <!-- ARTICLES -->
          <div v-else class="space-y-5">

            <article
              v-for="article in filteredArticles"
              :key="article.id"
              class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md"
            >

              <!-- AUTHOR -->
              <div class="flex items-center gap-3 px-4 pb-2 pt-4 sm:px-5">

                <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
                  {{ getInitials(article.user?.name) }}
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-bold">
                    {{ article.user?.name ?? 'Auteur inconnu' }}
                  </h3>

                  <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-light">
                    <span>{{ formatDate(article.created_at) }}</span>
                    <span>·</span>
                    <span class="font-medium text-primary">
                      {{ article.category?.name ?? 'Général' }}
                    </span>
                  </div>
                </div>

                <button
                  class="flex size-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-bg"
                  aria-label="Options"
                >
                  <MoreHorizontal :size="21" />
                </button>

              </div>


              <!-- ARTICLE CONTENT -->
              <div class="px-4 pb-4 pt-2 sm:px-5">

                <h2
                  @click="openArticle(article)"
                  class="mb-2 cursor-pointer text-lg font-bold leading-snug transition hover:text-primary"
                >
                  {{ article.title }}
                </h2>

                <p class="whitespace-pre-line break-words text-sm leading-7 text-text-muted line-clamp-5">
                  {{ article.content }}
                </p>

                <button
                  @click="openArticle(article)"
                  class="mt-2 text-sm font-bold text-primary transition hover:text-primary-hover"
                >
                  Lire la suite
                </button>

              </div>


              <!-- COVER IMAGE -->
              <img
                v-if="article.image"
                :src="article.image"
                :alt="article.title"
                loading="lazy"
                class="max-h-[480px] w-full bg-bg object-cover"
              />


              <!-- STATS -->
              <div class="flex items-center justify-between px-5 py-3 text-xs text-text-muted">

                <span class="flex items-center gap-1.5">
                  <Heart :size="15" class="text-danger" />
                  {{ likedArticles.has(article.id) ? 1 : 0 }}
                </span>

                <button
                  @click="openArticle(article)"
                  class="hover:underline"
                >
                  {{ article.comments_count ?? 0 }} commentaires
                </button>

              </div>


              <!-- ACTIONS -->
              <div class="mx-4 grid grid-cols-3 border-t border-border py-1">

                <button
                  @click="toggleLike(article.id)"
                  :class="likedArticles.has(article.id) ? 'text-danger' : 'text-text-muted'"
                  class="flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold transition hover:bg-bg sm:text-sm"
                >
                  <Heart
                    :size="19"
                    :fill="likedArticles.has(article.id) ? 'currentColor' : 'none'"
                  />
                  J'aime
                </button>

                <button
                  @click="openArticle(article)"
                  class="flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-text-muted transition hover:bg-bg sm:text-sm"
                >
                  <MessageCircle :size="19" />
                  Commenter
                </button>

                <button
                  @click="openArticle(article)"
                  class="flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-text-muted transition hover:bg-bg sm:text-sm"
                >
                  <Share2 :size="19" />
                  Partager
                </button>

              </div>

            </article>

          </div>


          <!-- INFINITE SCROLL -->
          <div
            v-if="!searchQuery && currentPage < lastPage"
            ref="observerTarget"
            class="flex min-h-24 items-center justify-center"
          >
            <LoaderCircle
              v-if="loadingMore"
              :size="30"
              class="animate-spin text-primary"
            />

            <span v-else class="text-xs text-text-light">
              Faites défiler pour découvrir plus de publications.
            </span>
          </div>


          <!-- END OF FEED -->
          <div
            v-if="articles.length && currentPage >= lastPage && !loadingMore"
            class="py-8 text-center text-xs text-text-light"
          >
            Vous êtes à jour ! Vous avez découvert toutes les publications.
          </div>


          <!-- PAGINATION ERROR -->
          <div
            v-if="error && articles.length"
            class="mt-3 flex items-center justify-between rounded-xl border border-danger/30 bg-danger-bg p-4 text-sm text-danger"
          >
            {{ error }}

            <button
              @click="loadMore"
              class="font-semibold underline"
            >
              Réessayer
            </button>
          </div>

        </template>

      </section>

    </div>
  </main>
</template>
