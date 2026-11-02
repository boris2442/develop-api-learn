
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "../api/index.js";

const route = useRoute();
const router = useRouter();

const form = ref({
  title: "",
  content: "",
  category_id: "",
  image: null,
});

const article = ref(null);
const categories = ref([]);

const loading = ref(false);
const fetching = ref(true);
const errors = ref({});
const errorMessage = ref("");

const imagePreview = ref(null);

// Charger l'article et les catégories
const fetchData = async () => {
  fetching.value = true;
  errorMessage.value = "";

  try {
    const [articleResponse, categoriesResponse] = await Promise.all([
      apiClient.get(`/api/articles/${route.params.slug}`),
      apiClient.get("/api/categories"),
    ]);

    article.value = articleResponse.data.data ?? articleResponse.data;

    categories.value =
      categoriesResponse.data.data ?? categoriesResponse.data;

    // Préremplir le formulaire
    form.value.title = article.value.title;
    form.value.content = article.value.content;
    form.value.category_id =
      article.value.category_id ?? article.value.category?.id ?? "";
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger les données de l'article.";
  } finally {
    fetching.value = false;
  }
};

// Récupérer la nouvelle image
const handleImage = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

// Enregistrer les modifications
const updateArticle = async () => {
  loading.value = true;
  errors.value = {};
  errorMessage.value = "";

  try {
    const formData = new FormData();

    formData.append("title", form.value.title);
    formData.append("content", form.value.content);
    formData.append("category_id", form.value.category_id);

    if (form.value.image) {
      formData.append("image", form.value.image);
    }

    // Laravel interprétera cette requête POST comme un PUT
    formData.append("_method", "PUT");

    const response = await apiClient.post(
      `/api/articles/${route.params.slug}`,
      formData
    );

    const updatedArticle = response.data.data ?? response.data;

    // Rediriger vers l'article actualisé
    router.push({
      name: "articles.show",
      params: { slug: updatedArticle.slug },
    });

  } catch (error) {
    console.error("Erreur de modification :", error.response?.data);

    if (error.response?.status === 422) {
      errors.value = error.response.data.errors ?? {};
      errorMessage.value = error.response.data.message ?? "";
    } else {
      errorMessage.value =
        "Une erreur est survenue lors de la modification.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

onBeforeUnmount(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<template>
  <main class="min-h-screen bg-slate-100 py-10 px-4">
    <div class="max-w-2xl mx-auto">

      <button
        @click="router.back()"
        class="mb-6 text-indigo-600 font-medium hover:text-indigo-800"
      >
        ← Retour
      </button>

      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
      >
        <h1 class="text-2xl font-bold text-slate-900">
          Modifier l'article
        </h1>

        <p class="text-sm text-slate-500 mt-2 mb-8">
          Modifie les informations de ton article.
        </p>

        <div
          v-if="errorMessage"
          class="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
        >
          {{ errorMessage }}
        </div>

        <div v-if="fetching" class="py-10 text-center text-slate-500">
          Chargement des données...
        </div>

        <form
          v-else-if="article"
          @submit.prevent="updateArticle"
          class="space-y-6"
        >

          <!-- Titre -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Titre de l'article
            </label>

            <input
              v-model="form.title"
              type="text"
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p v-if="errors.title" class="text-red-500 text-xs mt-1">
              {{ errors.title[0] }}
            </p>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Catégorie
            </label>

            <select
              v-model="form.category_id"
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Sélectionner une catégorie
              </option>

              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>

            <p v-if="errors.category_id" class="text-red-500 text-xs mt-1">
              {{ errors.category_id[0] }}
            </p>
          </div>

          <!-- Contenu -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Contenu de l'article
            </label>

            <textarea
              v-model="form.content"
              rows="8"
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>

            <p v-if="errors.content" class="text-red-500 text-xs mt-1">
              {{ errors.content[0] }}
            </p>
          </div>

          <!-- Image actuelle ou nouvelle image -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Image de couverture
            </label>

            <div v-if="imagePreview || article.image" class="mb-4">
              <img
                :src="imagePreview || article.image"
                alt="Aperçu de l'image"
                class="w-full max-h-64 object-cover rounded-xl"
              />
              <p class="text-xs text-slate-400 mt-2">
                {{ imagePreview ? "Nouvelle image sélectionnée" : "Image actuelle" }}
              </p>
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleImage"
              class="w-full rounded-lg border border-slate-300 p-3 text-sm"
            />

            <p class="text-xs text-slate-400 mt-2">
              Sélectionne une nouvelle image uniquement si tu souhaites
              remplacer l'image actuelle. Maximum 2 Mo.
            </p>

            <p v-if="errors.image" class="text-red-500 text-xs mt-1">
              {{ errors.image[0] }}
            </p>
          </div>

          <!-- Boutons -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="router.back()"
              class="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="flex-1 rounded-lg bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ loading ? "Enregistrement..." : "Enregistrer" }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </main>
</template>
