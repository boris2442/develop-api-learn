<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import apiClient from "../api/index.js";
import ReactionPicker from "@/components/ReactionPicker.vue";
import {
  ArrowLeft,
  MoreHorizontal,
  Share2,
  Copy,
  Pencil,
  Trash2,
  Bookmark,
  MessageCircle,
  Send,
  CornerDownRight,
  LoaderCircle,
  RefreshCw,
  CalendarDays,
  Flag,
  X,
  Check,
} from "@lucide/vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const article = ref(null);
const loading = ref(true);
const error = ref("");
const activeMenu = ref(null);
const copied = ref(false);
const newCommentContent = ref("");
const submittingComment = ref(false);
const commentError = ref("");
const replyingToId = ref(null);
const replyContent = ref("");
const submittingReply = ref(false);
const replyError = ref("");
const deleting = ref(false);
const savedArticles = ref(new Set());

const currentUserId = computed(() => authStore.user?.id);
const authorName = computed(
  () => article.value?.user?.name ?? "Auteur inconnu",
);
const commentsCount = computed(
  () => article.value?.comments_count ?? article.value?.comments?.length ?? 0,
);
const isAuthor = computed(() =>
  Boolean(
    currentUserId.value && article.value?.user?.id === currentUserId.value,
  ),
);
const isSaved = computed(
  () => article.value && savedArticles.value.has(article.value.id),
);

const initials = (name) =>
  (name || "Utilisateur")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const fetchArticle = async () => {
  loading.value = true;
  error.value = "";
  activeMenu.value = null;
  try {
    const response = await apiClient.get(`/api/articles/${route.params.slug}`);
    article.value = response.data.data ?? response.data;
  } catch (err) {
    console.error(err);
    error.value =
      "Impossible de charger cette publication. Vérifiez votre connexion puis réessayez.";
  } finally {
    loading.value = false;
  }
};

const closeMenus = (event) => {
  if (!event.target.closest("[data-action-menu]")) activeMenu.value = null;
};
const toggleMenu = (key) => {
  activeMenu.value = activeMenu.value === key ? null : key;
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    activeMenu.value = null;
    window.setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch (err) {
    console.error(err);
    window.prompt(
      "Copiez le lien de cette publication :",
      window.location.href,
    );
  }
};

const shareArticle = async () => {
  activeMenu.value = null;
  try {
    if (navigator.share) {
      await navigator.share({
        title: article.value?.title ?? "Publication NEXORA",
        url: window.location.href,
      });
    } else {
      await copyLink();
    }
  } catch (err) {
    if (err?.name !== "AbortError") console.error(err);
  }
};

const editArticle = () => {
  activeMenu.value = null;
  router.push({ name: "EditArticle", params: { slug: article.value.slug } });
};

const deleteArticle = async () => {
  if (!article.value || deleting.value) return;
  const confirmed = window.confirm(
    "Voulez-vous vraiment supprimer cette publication ? Cette action est irréversible.",
  );
  if (!confirmed) return;
  deleting.value = true;
  try {
    await apiClient.delete(`/api/articles/${article.value.id}`);
    activeMenu.value = null;
    router.push("/");
  } catch (err) {
    console.error(err);
    window.alert(
      "La suppression a échoué. Vérifiez que la route DELETE /api/articles/{id} est disponible et que vous êtes autorisé à supprimer cette publication.",
    );
  } finally {
    deleting.value = false;
  }
};

const toggleSave = () => {
  if (!article.value) return;
  const next = new Set(savedArticles.value);
  next.has(article.value.id)
    ? next.delete(article.value.id)
    : next.add(article.value.id);
  savedArticles.value = next;
  activeMenu.value = null;
};

const submitComment = async () => {
  const content = newCommentContent.value.trim();
  if (!content || !article.value || submittingComment.value) return;
  submittingComment.value = true;
  commentError.value = "";
  try {
    const response = await apiClient.post(
      `/api/articles/${article.value.id}/comments`,
      { content },
    );
    const comment = response.data.data ?? response.data;
    if (!article.value.comments) article.value.comments = [];
    article.value.comments.unshift(comment);
    if (typeof article.value.comments_count === "number")
      article.value.comments_count++;
    newCommentContent.value = "";
  } catch (err) {
    console.error(err);
    commentError.value = "Impossible de publier le commentaire. Réessayez.";
  } finally {
    submittingComment.value = false;
  }
};

const submitReply = async (parentId) => {
  const content = replyContent.value.trim();
  if (!content || !article.value || submittingReply.value) return;
  submittingReply.value = true;
  replyError.value = "";
  try {
    const response = await apiClient.post(
      `/api/articles/${article.value.id}/comments`,
      { content, parent_id: parentId },
    );
    const reply = response.data.data ?? response.data;
    const parent = article.value.comments?.find(
      (comment) => comment.id === parentId,
    );
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(reply);
    }
    if (typeof article.value.comments_count === "number")
      article.value.comments_count++;
    replyContent.value = "";
    replyingToId.value = null;
  } catch (err) {
    console.error(err);
    replyError.value = "Impossible d'envoyer la réponse. Réessayez.";
  } finally {
    submittingReply.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.push("/");
};

onMounted(() => {
  fetchArticle();
  document.addEventListener("click", closeMenus);
});
onUnmounted(() => document.removeEventListener("click", closeMenus));
watch(() => route.params.slug, fetchArticle);
</script>

<template>
  <main class="min-h-screen bg-bg pb-12 pt-[190px] text-text-main">
    <!-- Barre de lecture persistante : retour à gauche, auteur et menu à droite -->
    <header
      class="fixed inset-x-0 top-[122px] z-40 border-b border-border bg-surface/95 shadow-sm backdrop-blur-xl"
    >
      <div class="flex h-[68px] w-full items-center gap-3 px-3 sm:px-6">
        <!-- Retour -->
        <button
          type="button"
          @click="goBack"
          aria-label="Retour"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-text-main transition hover:bg-bg"
        >
          <ArrowLeft :size="21" />
        </button>

        <!-- Auteur -->
        <div v-if="article" class="ml-3 flex min-w-0 items-center gap-2">
          <div
            class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary"
          >
            <img
              v-if="article.user?.image"
              :src="article.user.image"
              :alt="authorName"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ initials(authorName) }}</span>
          </div>

          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">{{ authorName }}</p>
            <p class="text-[11px] text-text-muted">Auteur</p>
          </div>
        </div>

        <!-- Actions complètement à droite -->
        <!-- <div v-if="article" class="relative ml-auto shrink-0" data-action-menu>
          <button
            type="button"
            @click.stop="toggleMenu('header')"
            aria-label="Actions de la publication"
            class="flex size-10 items-center justify-end rounded-full text-text-muted transition hover:bg-bg hover:text-text-main"
          >
            <MoreHorizontal :size="23" />
          </button>

          <div
            v-if="activeMenu === 'header'"
            class="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl"
          >
            <button @click="shareArticle" class="menu-action">
              <Share2 :size="17" /> Partager
            </button>

            <button @click="copyLink" class="menu-action">
              <Copy :size="17" /> Copier le lien
            </button>

            <button @click="toggleSave" class="menu-action">
              <Bookmark :size="17" />
              {{ isSaved ? "Retirer des enregistrements" : "Enregistrer" }}
            </button>

            <template v-if="isAuthor">
              <div class="my-1 border-t border-border"></div>

              <button @click="editArticle" class="menu-action">
                <Pencil :size="17" /> Modifier la publication
              </button>

              <button
                @click="deleteArticle"
                :disabled="deleting"
                class="menu-action text-danger hover:bg-danger-bg"
              >
                <LoaderCircle v-if="deleting" :size="17" class="animate-spin" />
                <Trash2 v-else :size="17" />
                Supprimer la publication
              </button>
            </template>

            <button v-else class="menu-action">
              <Flag :size="17" /> Signaler
            </button>
          </div>
        </div> -->
      </div>
    </header>

    <div class="mx-auto max-w-3xl px-3 sm:px-6">
      <div
        v-if="loading"
        class="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface"
      >
        <LoaderCircle :size="30" class="animate-spin text-primary" />
        <p class="text-sm text-text-muted">Chargement de la publication...</p>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-bg text-text-muted"
        >
          <RefreshCw :size="22" />
        </div>
        <h2 class="font-bold">Publication indisponible</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
          {{ error }}
        </p>
        <button
          @click="fetchArticle"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <RefreshCw :size="16" />Réessayer
        </button>
      </div>

      <template v-else-if="article">
        <article
          class="overflow-visible rounded-2xl border border-border bg-surface shadow-sm"
        >
          <!-- Auteur et menu contextuel façon réseau social -->
          <div class="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-6">
            <div
              class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-sm font-bold text-primary"
            >
              <img
                v-if="article.user?.image"
                :src="article.user.image"
                :alt="authorName"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ initials(authorName) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold">{{ authorName }}</p>
              <p
                class="flex flex-wrap items-center gap-1.5 text-xs text-text-muted"
              >
                <span>{{ formatDate(article.created_at) }}</span
                ><span aria-hidden="true">·</span
                ><span>{{ article.category?.name ?? "Général" }}</span>
              </p>
            </div>
            <div class="relative" data-action-menu>
              <button
                type="button"
                @click.stop="toggleMenu('article')"
                aria-label="Plus d'options"
                class="flex size-10 items-center justify-center rounded-full text-text-muted transition hover:bg-bg hover:text-text-main"
              >
                <MoreHorizontal :size="23" />
              </button>
              <div
                v-if="activeMenu === 'article'"
                class="absolute right-0 top-11 z-30 w-60 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-xl"
              >
                <button @click="shareArticle" class="menu-action">
                  <Share2 :size="17" />Partager
                </button>
                <button @click="copyLink" class="menu-action">
                  <Copy :size="17" />Copier le lien
                </button>
                <button @click="toggleSave" class="menu-action">
                  <Bookmark :size="17" />{{
                    isSaved ? "Retirer des enregistrements" : "Enregistrer"
                  }}
                </button>
                <template v-if="isAuthor">
                  <div class="my-1 border-t border-border"></div>
                  <button @click="editArticle" class="menu-action">
                    <Pencil :size="17" />Modifier la publication
                  </button>
                  <button
                    @click="deleteArticle"
                    :disabled="deleting"
                    class="menu-action text-danger hover:bg-danger-bg"
                  >
                    <LoaderCircle
                      v-if="deleting"
                      :size="17"
                      class="animate-spin"
                    /><Trash2 v-else :size="17" />Supprimer la publication
                  </button>
                </template>
                <button v-else class="menu-action">
                  <Flag :size="17" />Signaler
                </button>
              </div>
            </div>
          </div>

          <div class="px-4 pb-4 sm:px-6">
            <h1
              class="mb-3 text-xl font-extrabold leading-snug tracking-tight sm:text-2xl"
            >
              {{ article.title }}
            </h1>
            <p
              class="whitespace-pre-line break-words text-[15px] leading-7 text-text-main sm:text-base"
            >
              {{ article.content }}
            </p>
          </div>

          <div v-if="article.image" class="max-h-[620px] overflow-hidden bg-bg">
            <img
              :src="article.image"
              :alt="article.title"
              class="mx-auto max-h-[620px] w-full object-contain"
            />
          </div>

          <div
            class="mx-4 flex items-center justify-between border-b border-border px-1 py-3 text-xs text-text-muted sm:mx-6"
          >
            <span
              >{{ commentsCount }} commentaire{{
                commentsCount === 1 ? "" : "s"
              }}</span
            >
            <span
              v-if="copied"
              class="inline-flex items-center gap-1 text-primary"
              ><Check :size="14" />Lien copié</span
            >
          </div>
          <div class="mx-3 grid grid-cols-3 gap-1 py-1 sm:mx-5">
             <!-- Appel du composant ReactionPicker -->
            <ReactionPicker 
              v-model="userReaction" 
              @react="handleReactionChange" 
            />
            <button
              type="button"
              @click="document.getElementById('comment-composer')?.focus()"
              class="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-text-muted transition hover:bg-bg hover:text-primary"
            >
              <MessageCircle :size="19" />Commenter
            </button>

           
            <button
              type="button"
              @click="shareArticle"
              class="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-text-muted transition hover:bg-bg hover:text-primary"
            >
              <Share2 :size="19" />Partager
            </button>
          </div>
        </article>

        <!-- Espace de discussion -->
        <section
          class="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-extrabold">Commentaires</h2>
              <p class="mt-0.5 text-xs text-text-muted">
                La discussion continue ici.
              </p>
            </div>
            <span
              class="rounded-full bg-bg px-3 py-1 text-xs font-bold tabular-nums text-text-muted"
              >{{ commentsCount }}</span
            >
          </div>

          <form @submit.prevent="submitComment" class="mb-6">
            <div class="flex gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary"
              >
                <img
                  v-if="authStore.user?.image"
                  :src="authStore.user.image"
                  :alt="authStore.user.name"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ initials(authStore.user?.name) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <textarea
                  id="comment-composer"
                  v-model="newCommentContent"
                  rows="2"
                  maxlength="2000"
                  placeholder="Écrivez un commentaire..."
                  class="w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                ></textarea>
                <p v-if="commentError" class="mt-2 text-xs text-danger">
                  {{ commentError }}
                </p>
                <div class="mt-2 flex justify-end">
                  <button
                    type="submit"
                    :disabled="!newCommentContent.trim() || submittingComment"
                    class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <LoaderCircle
                      v-if="submittingComment"
                      :size="15"
                      class="animate-spin"
                    /><Send v-else :size="14" />{{
                      submittingComment ? "Envoi..." : "Commenter"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div class="space-y-5 border-t border-border pt-5">
            <div v-if="article.comments?.length">
              <div
                v-for="comment in article.comments"
                :key="comment.id"
                class="flex gap-2.5"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary"
                >
                  <img
                    v-if="comment.user?.image"
                    :src="comment.user.image"
                    :alt="comment.user?.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ initials(comment.user?.name) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div
                    class="inline-block max-w-full rounded-2xl bg-bg px-4 py-3"
                  >
                    <p class="mb-1 text-xs font-bold">
                      {{ comment.user?.name ?? "Utilisateur" }}
                    </p>
                    <p
                      class="whitespace-pre-line break-words text-sm leading-6"
                    >
                      {{ comment.content }}
                    </p>
                  </div>
                  <div
                    class="mt-1 flex items-center gap-3 px-2 text-[11px] text-text-muted"
                  >
                    <time>{{ formatDate(comment.created_at) }}</time>
                    <button
                      type="button"
                      @click="
                        replyingToId =
                          replyingToId === comment.id ? null : comment.id;
                        replyContent = '';
                        replyError = '';
                      "
                      class="font-bold transition hover:text-primary"
                    >
                      {{ replyingToId === comment.id ? "Annuler" : "Répondre" }}
                    </button>
                    <span v-if="comment.replies?.length"
                      >{{ comment.replies.length }} réponse(s)</span
                    >
                  </div>

                  <form
                    v-if="replyingToId === comment.id"
                    @submit.prevent="submitReply(comment.id)"
                    class="mt-3 flex gap-2"
                  >
                    <CornerDownRight
                      :size="16"
                      class="mt-3 shrink-0 text-text-muted"
                    />
                    <div class="min-w-0 flex-1">
                      <textarea
                        v-model="replyContent"
                        rows="2"
                        maxlength="2000"
                        placeholder="Écrire une réponse..."
                        class="w-full resize-y rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      ></textarea>
                      <p v-if="replyError" class="mt-1 text-xs text-danger">
                        {{ replyError }}
                      </p>
                      <div class="mt-2 flex justify-end">
                        <button
                          type="submit"
                          :disabled="!replyContent.trim() || submittingReply"
                          class="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {{ submittingReply ? "Envoi..." : "Envoyer" }}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div
                    v-if="comment.replies?.length"
                    class="ml-2 mt-3 space-y-3 border-l-2 border-border pl-3"
                  >
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="flex gap-2"
                    >
                      <div
                        class="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light text-[10px] font-bold text-primary"
                      >
                        <img
                          v-if="reply.user?.image"
                          :src="reply.user.image"
                          :alt="reply.user?.name"
                          class="h-full w-full object-cover"
                        /><span v-else>{{ initials(reply.user?.name) }}</span>
                      </div>
                      <div class="min-w-0 flex-1 rounded-xl bg-bg px-3 py-2.5">
                        <p class="mb-1 text-xs font-bold">
                          {{ reply.user?.name ?? "Utilisateur" }}
                        </p>
                        <p
                          class="whitespace-pre-line break-words text-xs leading-5"
                        >
                          {{ reply.content }}
                        </p>
                        <time class="mt-1 block text-[10px] text-text-muted">{{
                          formatDate(reply.created_at)
                        }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center">
              <div
                class="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-bg text-text-muted"
              >
                <MessageCircle :size="21" />
              </div>
              <p class="text-sm font-semibold">
                Aucun commentaire pour le moment
              </p>
              <p class="mt-1 text-xs text-text-muted">
                Soyez le premier à lancer la discussion.
              </p>
            </div>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.menu-action {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.625rem;
  padding: 0.7rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main, inherit);
  transition:
    background-color 150ms ease,
    color 150ms ease;
}
.menu-action:hover {
  background: var(--bg, rgba(0, 0, 0, 0.04));
}
.menu-action:disabled {
  cursor: wait;
  opacity: 0.6;
}
</style>
