<script setup>
import { useAuthStore } from "../stores/authStore";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useArticleStore } from "../stores/articleStore.js";

// Récupérer notre store
const articleStore = useArticleStore();

// Récupérer les données réactives du store
const { articles, loading, error, currentPage, lastPage } =
  storeToRefs(articleStore);

// Fonction pour demander les articles à Pinia
const fetchArticles = (page = 1, force = false) => {
  return articleStore.fetchArticles(page, force);
};

// Charger les articles lorsque la page s'affiche
onMounted(() => {
  fetchArticles();
});

const authStore = useAuthStore();

// Au chargement de la page d'accueil, on récupère le profil si le token existe
onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 sm:px-8 w-[100%]">
    <!-- Si l'utilisateur est connecté -->
    <div v-if="authStore.user">
      <h1 class="text-2xl font-bold text-slate-900">
        Bienvenue, <span class="text-indigo-600">{{ authStore.user.name }}</span> ! 👋
      </h1>
      <p class="text-slate-600 mt-2">Heureux de vous revoir sur votre tableau de bord.</p>
    </div>

    <!-- Si l'utilisateur n'est pas connecté -->
    <div v-else>
      <h1 class="text-2xl font-bold text-slate-900">Bienvenue sur MonBlog</h1>
      <p class="text-slate-600 mt-2">Veuillez vous connecter pour profiter de toutes les fonctionnalités.</p>
      
     
    </div>

    <div class="mx-auto">
      <header class="mb-10">
        <p
          class="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600"
        >
          BLOGS
        </p>
        <router-link
          :to="{ name: 'CreateArticle' }"
          class="bg-indigo-600 text-white px-5 py-3 rounded-lg"
        >
          Créer un article
        </router-link>
        <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
          Découvrez nos articles
        </h1>

        <p class="mt-3 text-slate-600">
          Explorez les dernières publications de notre communauté.
        </p>
      </header>



      <div v-if="loading" class="py-16 text-center text-slate-500">
        Chargement des articles...
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
      >
        {{ error }}

        <button
          @click="fetchArticles(currentPage)"
          class="ml-3 font-semibold underline"
        >
          Réessayer
        </button>
      </div>

      <div
        v-else-if="articles.length === 0"
        class="py-16 text-center text-slate-500"
      >
        Aucun article disponible pour le moment.
      </div>

      <template v-else>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="article in articles"
            :key="article.id"
            class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="h-48 w-full object-cover"
            />

            <div class="p-5">
              <p class="mb-3 text-sm font-medium text-indigo-600">
                {{ article.category?.name ?? "Sans catégorie" }}
              </p>

              <h2 class="mb-3 text-xl font-bold text-slate-900">
                <router-link
                  :to="{
                    name: 'articles.show',
                    params: { slug: article.slug },
                  }"
                >
                  {{ article.title }}
                </router-link>
              </h2>

              <p class="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {{ article.content }}
              </p>

              <div
                class="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"
              >
                <span> Par {{ article.user?.name ?? "Auteur inconnu" }} </span>

                <span> {{ article.comments_count ?? 0 }} commentaires </span>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-10 flex items-center justify-center gap-5">
          <button
            :disabled="currentPage <= 1"
            @click="fetchArticles(currentPage - 1)"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Précédent
          </button>

          <span class="text-sm text-slate-600">
            Page {{ currentPage }} sur {{ lastPage }}
          </span>

          <button
            :disabled="currentPage >= lastPage"
            @click="fetchArticles(currentPage + 1)"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
