<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "../api/index.js";

const route = useRoute();
const router = useRouter();

const article = ref(null);
const loading = ref(true);
const error = ref(null);

// États pour la gestion du nouveau commentaire
const newCommentContent = ref("");
const submittingComment = ref(false);
const commentError = ref("");

const fetchArticle = async () => {
  loading.value = true;
  error.value = null;

  try {
    const slug = route.params.slug;
    const response = await apiClient.get(`/api/articles/${slug}`);
    article.value = response.data.data ?? response.data;
  } catch (err) {
    console.error(err);
    error.value = "Impossible de charger cet article.";
  } finally {
    loading.value = false;
  }
};

// Fonction pour soumettre le commentaire
const submitComment = async () => {
  if (!newCommentContent.value.trim() || !article.value) return;

  submittingComment.value = true;
  commentError.value = "";

  try {
    const response = await apiClient.post(
      `/api/articles/${article.value.id}/comments`,
      {
        content: newCommentContent.value,
      },
    );

    const newComment = response.data.data ?? response.data;

    // S'assurer que le tableau des commentaires existe
    if (!article.value.comments) {
      article.value.comments = [];
    }

    // Ajouter le commentaire tout en haut de la liste
    article.value.comments.unshift(newComment);

    // Incrémenter le compteur de commentaires s'il existe
    if (typeof article.value.comments_count === "number") {
      article.value.comments_count++;
    }

    // Réinitialiser le champ
    newCommentContent.value = "";
  } catch (err) {
    console.error(err);
    commentError.value = "Impossible d'ajouter le commentaire.";
  } finally {
    submittingComment.value = false;
  }
};

// Suivi du commentaire auquel l'utilisateur est en train de répondre (contient l'ID du commentaire parent)
const replyingToId = ref(null);
const replyContent = ref("");
const submittingReply = ref(false);
const replyError = ref("");

// Fonction pour envoyer une réponse
const submitReply = async (parentId) => {
  if (!replyContent.value.trim() || !article.value) return;

  submittingReply.value = true;
  replyError.value = "";

  try {
    const response = await apiClient.post(
      `/api/articles/${article.value.id}/comments`,
      {
        content: replyContent.value,
        parent_id: parentId, // On transmet l'ID du commentaire parent
      },
    );

    const newReply = response.data.data ?? response.data;

    // Trouver le commentaire parent dans notre liste pour lui ajouter la réponse
    const parentComment = article.value.comments.find((c) => c.id === parentId);
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push(newReply);
    }

    // Incrémenter le compteur global de commentaires
    if (typeof article.value.comments_count === "number") {
      article.value.comments_count++;
    }

    // Réinitialiser le formulaire de réponse
    replyContent.value = "";
    replyingToId.value = null;
  } catch (err) {
    console.error(err);
    replyError.value = "Impossible d'envoyer la réponse.";
  } finally {
    submittingReply.value = false;
  }
};

onMounted(fetchArticle);

// Recharge l'article si le slug change
watch(() => route.params.slug, fetchArticle);
</script>

<template>
  <main class="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Bouton de retour -->
      <button
        @click="router.back()"
        class="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Retour aux articles
      </button>

      <!-- Chargement -->
      <div v-if="loading" class="py-20 text-center text-slate-500 font-medium">
        Chargement de l'article...
      </div>

      <!-- Erreur -->
      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700"
      >
        <p>{{ error }}</p>
        <button
          @click="fetchArticle"
          class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          Réessayer
        </button>
      </div>

      <!-- Contenu de l'article -->
      <article
        v-else-if="article"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <!-- En-tête de l'article -->
        <div class="p-6 sm:p-8 pb-4 border-b border-slate-100">
          <span
            class="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-full"
          >
            {{ article.category?.name ?? "Général" }}
          </span>

          <h1
            class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug mb-4"
          >
            {{ article.title }}
          </h1>

          <div
            class="flex items-center justify-between gap-4 text-sm text-slate-500"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
              >
                {{ (article.user?.name ?? "A")[0].toUpperCase() }}
              </div>

              <div>
                <p class="font-semibold text-slate-800">
                  {{ article.user?.name ?? "Auteur inconnu" }}
                </p>

                <p class="text-xs text-slate-400">
                  Publié le
                  {{ new Date(article.created_at).toLocaleDateString() }}
                </p>
              </div>
            </div>

            <button
              @click="
                router.push({
                  name: 'EditArticle',
                  params: { slug: article.slug },
                })
              "
              class="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100 transition"
            >
              Modifier
            </button>
          </div>
        </div>

        <!-- Image principale -->
        <div
          v-if="article.image"
          class="w-full bg-slate-100 max-h-[450px] overflow-hidden"
        >
          <img
            :src="article.image"
            :alt="article.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Corps du texte -->
        <div
          class="p-6 sm:p-8 text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-base"
        >
          {{ article.content }}
        </div>

        <!-- Section Commentaires -->
        <section class="border-t border-slate-100 bg-slate-50 p-6 sm:p-8">
          <h2
            class="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between"
          >
            <span>Commentaires</span>
            <span
              class="text-sm font-normal text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full"
            >
              {{ article.comments_count ?? article.comments?.length ?? 0 }}
            </span>
          </h2>

          <!-- Formulaire d'ajout de commentaire (Décommenté et activé) -->
          <div class="mb-8 flex gap-3">
            <div
              class="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center font-bold text-slate-700 text-xs"
            >
              Moi
            </div>

            <div class="flex-grow">
              <textarea
                v-model="newCommentContent"
                rows="2"
                placeholder="Ajouter un commentaire..."
                class="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              ></textarea>

              <p v-if="commentError" class="text-red-500 text-xs mt-1">
                {{ commentError }}
              </p>

              <div class="mt-2 flex justify-end">
                <button
                  @click="submitComment"
                  :disabled="!newCommentContent.trim() || submittingComment"
                  class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {{ submittingComment ? "Envoi..." : "Commenter" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Liste des commentaires -->
          <!-- <div
            v-if="article.comments && article.comments.length > 0"
            class="space-y-4"
          >
            <div
              v-for="comment in article.comments"
              :key="comment.id"
              class="flex space-x-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs"
            >
              <div
                class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-xs"
              >
                {{ (comment.user?.name ?? "U")[0].toUpperCase() }}
              </div>
              <div class="flex-grow">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-semibold text-slate-900">{{
                    comment.user?.name ?? "Utilisateur"
                  }}</span>
                  <span class="text-xs text-slate-400">{{
                    new Date(comment.created_at).toLocaleDateString()
                  }}</span>
                </div>
                <p class="text-sm text-slate-600">{{ comment.content }}</p>
              </div>
            </div>
          </div> -->

          <!-- Liste des commentaires -->
          <div
            v-if="article.comments && article.comments.length > 0"
            class="space-y-6"
          >
            <div
              v-for="comment in article.comments"
              :key="comment.id"
              class="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-3"
            >
              <!-- Commentaire principal -->
              <div class="flex space-x-3">
                <div
                  class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-xs"
                >
                  {{ (comment.user?.name ?? "U")[0].toUpperCase() }}
                </div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-semibold text-slate-900">
                      {{ comment.user?.name ?? "Utilisateur" }}
                    </span>
                    <span class="text-xs text-slate-400">
                      {{ new Date(comment.created_at).toLocaleDateString() }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600">{{ comment.content }}</p>

                  <!-- Bouton pour déclencher l'affichage du champ de réponse -->
                  <button
                    @click="
                      replyingToId =
                        replyingToId === comment.id ? null : comment.id
                    "
                    class="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    Répondre
                  </button>
                </div>
              </div>

              <!-- Champ de saisie de la réponse (S'affiche uniquement si on clique sur Répondre de ce commentaire) -->
              <div
                v-if="replyingToId === comment.id"
                class="ml-11 mt-3 pl-3 border-l-2 border-indigo-100"
              >
                <textarea
                  v-model="replyContent"
                  rows="2"
                  placeholder="Écrire une réponse..."
                  class="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                ></textarea>

                <p v-if="replyError" class="text-red-500 text-xs mt-1">
                  {{ replyError }}
                </p>

                <div class="mt-2 flex justify-end space-x-2">
                  <button
                    @click="replyingToId = null"
                    class="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    @click="submitReply(comment.id)"
                    :disabled="!replyContent.trim() || submittingReply"
                    class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {{ submittingReply ? "Envoi..." : "Répondre" }}
                  </button>
                </div>
              </div>

              <!-- Affichage des sous-réponses (Fils de discussion) -->
              <div
                v-if="comment.replies && comment.replies.length > 0"
                class="ml-11 space-y-3 pt-3 border-t border-slate-100"
              >
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="flex space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200/40"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0 flex items-center justify-center font-bold text-xs"
                  >
                    {{ (reply.user?.name ?? "U")[0].toUpperCase() }}
                  </div>
                  <div class="flex-grow">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-semibold text-slate-900">
                        {{ reply.user?.name ?? "Utilisateur" }}
                      </span>
                      <span class="text-xs text-slate-400">
                        {{ new Date(reply.created_at).toLocaleDateString() }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-slate-400 text-sm">
            Aucun commentaire pour le moment. Soyez le premier à réagir !
          </div>
        </section>
      </article>
    </div>
  </main>
</template>
