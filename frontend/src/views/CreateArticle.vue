<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/index.js";

const router = useRouter();

// Les données du formulaire
const form = ref({
  title: "",
  content: "",
  category_id: "",
  image: null,
});

// Les catégories disponibles
const categories = ref([]);

// États de l'application
const loading = ref(false);
const fetchingCategories = ref(false);
const errors = ref({});
const errorMessage = ref("");

// Récupérer les catégories depuis Laravel
const fetchCategories = async () => {
  fetchingCategories.value = true;

  try {
    const response = await apiClient.get("/api/categories");

    categories.value = response.data.data ?? response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Impossible de charger les catégories.";
  } finally {
    fetchingCategories.value = false;
  }
};

// Récupérer l'image sélectionnée
const handleImage = (event) => {
  form.value.image = event.target.files[0] ?? null;
};

// Créer un article
const submitArticle = async () => {
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

    // const response = await apiClient.post("/api/articles", formData);
    const response = await apiClient.post("/api/articles", formData);

    const article = response.data.data ?? response.data;




    // Rediriger vers l'article créé
    router.push({
      name: "articles.show",
      params: { slug: article.slug },
    });
  } catch (error) {
    //   catch (error) {
    //     console.error(error);

    //     if (error.response?.status === 422) {
    //       errors.value = error.response.data.errors ?? {};
    //     } else {
    //       errorMessage.value = "Une erreur est survenue lors de la création.";
    //     }
    //   }

    console.error("Détails complets de l'erreur 422 :", error.response?.data);
console.log("Image sélectionnée :", form.value.image);
console.log("Est un fichier :", form.value.image instanceof File);
console.log("Type MIME :", form.value.image?.type);
console.log("Taille en Mo :", form.value.image?.size / 1024 / 1024);


    if (error.response?.status === 422) {
      // Si Laravel renvoie les erreurs de validation sous forme d'objet
      errors.value = error.response.data.errors ?? {};

      // S'il y a un message global
      if (error.response.data.message) {
        errorMessage.value = error.response.data.message;
      }
    } else {
      errorMessage.value = "Une erreur est survenue lors de la création.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategories);
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
        <h1 class="text-2xl font-bold text-slate-900">Créer un article</h1>

        <p class="text-sm text-slate-500 mt-2 mb-8">
          Partage tes idées et tes connaissances avec la communauté.
        </p>

        <!-- Message d'erreur général -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submitArticle" class="space-y-6">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Titre de l'article
            </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="Ex : Comprendre les API Resources Laravel"
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p v-if="errors.title" class="text-red-500 text-xs mt-1">
              {{ errors.title[0] }}
            </p>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-semibold mb-2"> Catégorie </label>

            <select
              v-model="form.category_id"
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Sélectionner une catégorie</option>

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

            <p v-if="fetchingCategories" class="text-xs text-slate-400 mt-1">
              Chargement des catégories...
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
              placeholder="Rédige ton article ici..."
              class="w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>

            <p v-if="errors.content" class="text-red-500 text-xs mt-1">
              {{ errors.content[0] }}
            </p>
          </div>

          <!-- Image -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Image de couverture
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleImage"
              class="w-full rounded-lg border border-slate-300 p-3 text-sm"
            />

            <p class="text-xs text-slate-400 mt-2">
              Formats acceptés : JPG, JPEG, PNG et WEBP. Maximum 2 Mo.
            </p>

            <p v-if="errors.image" class="text-red-500 text-xs mt-1">
              {{ errors.image[0] }}
            </p>
          </div>

          <!-- Bouton -->
          <button
            type="submit"
            :disabled="loading || fetchingCategories || categories.length === 0"
            class="w-full rounded-lg bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {{ loading ? "Publication en cours..." : "Publier l’article" }}
          </button>
        </form>
      </div>
    </div>
  </main>
</template>
