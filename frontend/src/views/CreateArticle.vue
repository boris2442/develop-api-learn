
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/index.js";

const router = useRouter();

const form = ref({
    title: "",
    content: "",
    category_id: "",
    image: null,
});

const categories = ref([]);
const loading = ref(false);
const fetchingCategories = ref(false);
const errors = ref({});
const errorMessage = ref("");
const imagePreview = ref(null);
const fileInput = ref(null);

const titleLimit = 150;
const contentLimit = 10000;

const titleLength = computed(() => form.value.title.length);
const contentLength = computed(() => form.value.content.length);

const isFormValid = computed(() =>
    form.value.title.trim() &&
    form.value.content.trim() &&
    form.value.category_id
);

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

const handleImage = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        errorMessage.value = "Format d'image non accepté.";
        event.target.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        errorMessage.value = "L'image ne doit pas dépasser 2 Mo.";
        event.target.value = "";
        return;
    }

    errorMessage.value = "";
    form.value.image = file;

    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }

    imagePreview.value = URL.createObjectURL(file);
};

const removeImage = () => {
    form.value.image = null;

    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
        imagePreview.value = null;
    }

    if (fileInput.value) {
        fileInput.value.value = "";
    }
};

const clearError = (field) => {
    if (errors.value[field]) {
        delete errors.value[field];
    }
};

const submitArticle = async () => {
    if (!isFormValid.value || loading.value) return;

    loading.value = true;
    errors.value = {};
    errorMessage.value = "";

    try {
        const formData = new FormData();

        formData.append("title", form.value.title.trim());
        formData.append("content", form.value.content.trim());
        formData.append("category_id", form.value.category_id);

        if (form.value.image) {
            formData.append("image", form.value.image);
        }

        const response = await apiClient.post(
            "/api/articles",
            formData
        );

        const article = response.data.data ?? response.data;

        router.push({
            name: "articles.show",
            params: { slug: article.slug },
        });

    } catch (error) {
        console.error(error.response?.data ?? error);

        if (error.response?.status === 422) {
            errors.value = error.response.data.errors ?? {};
            errorMessage.value =
                error.response.data.message ??
                "Vérifie les informations saisies.";
        } else {
            errorMessage.value =
                "Une erreur est survenue. Réessaie dans quelques instants.";
        }
    } finally {
        loading.value = false;
    }
};

onMounted(fetchCategories);

onUnmounted(() => {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
    }
});
</script>

<template>
    <main class="min-h-screen bg-bg text-text-main py-8 sm:py-12 px-4">

        <div class="max-w-6xl mx-auto">

            <!-- Navigation -->
            <button
                @click="router.back()"
                type="button"
                class="group inline-flex items-center gap-2 text-sm
                       font-medium text-text-muted hover:text-primary
                       transition-colors mb-8"
            >
                <span class="transition-transform group-hover:-translate-x-1">
                    ←
                </span>
                Retour
            </button>

            <!-- En-tête -->
            <div class="mb-9 max-w-2xl">
                <div class="flex items-center gap-2 mb-3">
                    <span class="w-8 h-1 rounded-full bg-primary"></span>
                    <span class="text-xs font-bold tracking-widest uppercase
                                 text-primary">
                        Communauté IUT
                    </span>
                </div>

                <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
                    Créer une publication
                </h1>

                <p class="mt-3 text-text-muted leading-relaxed">
                    Chaque histoire mérite d'être racontée.
                    Partage ton expérience avec les étudiants de l'IUT.
                </p>
            </div>

            <form
                @submit.prevent="submitArticle"
                class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7
                       items-start"
            >

                <!-- Formulaire principal -->
                <section class="bg-surface border border-border
                                rounded-2xl shadow-sm p-5 sm:p-8 space-y-7">

                    <!-- Erreur générale -->
                    <div
                        v-if="errorMessage"
                        class="flex items-start gap-3 rounded-xl
                               border border-danger/20 bg-danger-bg
                               p-4 text-sm text-danger"
                        role="alert"
                    >
                        <span class="font-bold">!</span>
                        <p>{{ errorMessage }}</p>
                    </div>

                    <!-- Titre -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="title"
                                   class="text-sm font-semibold">
                                Titre de la publication
                                <span class="text-danger">*</span>
                            </label>

                            <span class="text-xs text-text-light"
                                  :class="{ 'text-danger': titleLength > titleLimit }">
                                {{ titleLength }}/{{ titleLimit }}
                            </span>
                        </div>

                        <input
                            id="title"
                            v-model="form.title"
                            type="text"
                            maxlength="150"
                            placeholder="Donne un titre à ton histoire..."
                            @input="clearError('title')"
                            class="w-full bg-bg border rounded-xl px-4 py-3.5
                                   text-sm text-text-main
                                   placeholder:text-text-light
                                   outline-none transition-all
                                   focus:border-primary
                                   focus:ring-4 focus:ring-primary/10"
                            :class="errors.title
                                ? 'border-danger'
                                : 'border-border'"
                        />

                        <p v-if="errors.title"
                           class="mt-2 text-xs text-danger">
                            {{ errors.title[0] }}
                        </p>
                    </div>

                    <!-- Catégorie -->
                    <div>
                        <label for="category"
                               class="block text-sm font-semibold mb-2">
                            Catégorie
                            <span class="text-danger">*</span>
                        </label>

                        <select
                            id="category"
                            v-model="form.category_id"
                            @change="clearError('category_id')"
                            class="w-full bg-bg border rounded-xl px-4 py-3.5
                                   text-sm text-text-main outline-none
                                   transition-all focus:border-primary
                                   focus:ring-4 focus:ring-primary/10"
                            :class="errors.category_id
                                ? 'border-danger'
                                : 'border-border'"
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

                        <p v-if="fetchingCategories"
                           class="mt-2 text-xs text-text-muted">
                            Chargement des catégories...
                        </p>

                        <p v-if="errors.category_id"
                           class="mt-2 text-xs text-danger">
                            {{ errors.category_id[0] }}
                        </p>
                    </div>

                    <!-- Contenu -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label for="content"
                                   class="text-sm font-semibold">
                                Ton histoire
                                <span class="text-danger">*</span>
                            </label>

                            <span class="text-xs text-text-light">
                                {{ contentLength.toLocaleString() }}/10 000
                            </span>
                        </div>

                        <textarea
                            id="content"
                            v-model="form.content"
                            rows="11"
                            maxlength="10000"
                            placeholder="Raconte ton anecdote, ton expérience ou partage tes réflexions avec la communauté..."
                            @input="clearError('content')"
                            class="w-full resize-y bg-bg border rounded-xl
                                   px-4 py-4 text-sm leading-7
                                   text-text-main placeholder:text-text-light
                                   outline-none transition-all
                                   focus:border-primary
                                   focus:ring-4 focus:ring-primary/10"
                            :class="errors.content
                                ? 'border-danger'
                                : 'border-border'"
                        ></textarea>

                        <p v-if="errors.content"
                           class="mt-2 text-xs text-danger">
                            {{ errors.content[0] }}
                        </p>

                        <p class="mt-2 text-xs text-text-light">
                            Astuce : une histoire bien racontée est toujours
                            plus agréable à lire.
                        </p>
                    </div>

                    <!-- Image -->
                    <div>
                        <label class="block text-sm font-semibold mb-3">
                            Image de couverture
                            <span class="font-normal text-text-light">
                                (facultatif)
                            </span>
                        </label>

                        <!-- Aperçu -->
                        <div v-if="imagePreview"
                             class="relative rounded-xl overflow-hidden
                                    border border-border">

                            <img
                                :src="imagePreview"
                                alt="Aperçu de l'image de couverture"
                                class="w-full max-h-72 object-cover"
                            />

                            <button
                                type="button"
                                @click="removeImage"
                                class="absolute top-3 right-3 bg-surface
                                       text-danger rounded-lg p-2 shadow-md
                                       hover:bg-danger-bg transition"
                                aria-label="Supprimer l'image"
                            >
                                ✕
                            </button>

                            <div class="p-3 bg-surface">
                                <p class="text-xs text-text-muted truncate">
                                    {{ form.image?.name }}
                                </p>
                            </div>
                        </div>

                        <!-- Zone de sélection -->
                        <label
                            v-else
                            for="image"
                            class="flex flex-col items-center justify-center
                                   gap-3 p-8 sm:p-10 rounded-xl
                                   border border-dashed border-border
                                   bg-bg cursor-pointer
                                   hover:border-primary
                                   hover:bg-primary-light/30
                                   transition-all"
                        >
                            <div class="w-12 h-12 rounded-xl
                                        bg-primary-light flex items-center
                                        justify-center text-primary text-xl">
                                +
                            </div>

                            <div class="text-center">
                                <p class="text-sm font-semibold">
                                    Ajouter une image
                                </p>
                                <p class="text-xs text-text-muted mt-1">
                                    Clique pour parcourir tes fichiers
                                </p>
                            </div>

                            <span class="text-xs text-text-light">
                                JPG, PNG ou WEBP · Maximum 2 Mo
                            </span>
                        </label>

                        <input
                            ref="fileInput"
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            @change="handleImage"
                            class="hidden"
                        />

                        <p v-if="errors.image"
                           class="mt-2 text-xs text-danger">
                            {{ errors.image[0] }}
                        </p>
                    </div>

                    <!-- Bouton -->
                    <div class="pt-5 border-t border-border">
                        <button
                            type="submit"
                            :disabled="loading || fetchingCategories ||
                                       categories.length === 0 ||
                                       !isFormValid"
                            class="w-full flex items-center justify-center
                                   gap-2 rounded-xl bg-primary
                                   text-white font-semibold text-sm
                                   py-4 px-5 shadow-sm
                                   hover:bg-primary-hover
                                   active:scale-[0.99]
                                   disabled:opacity-50
                                   disabled:cursor-not-allowed
                                   transition-all"
                        >
                            <span v-if="loading"
                                  class="animate-spin rounded-full h-4 w-4
                                         border-2 border-white/30
                                         border-t-white">
                            </span>

                            {{ loading
                                ? "Publication en cours..."
                                : "Publier ma publication →" }}
                        </button>

                        <p class="text-center text-xs text-text-light mt-3">
                            En publiant, tu partages ton contenu avec
                            la communauté IUT Stories.
                        </p>
                    </div>
                </section>

                <!-- Colonne latérale -->
                <aside class="space-y-5 lg:sticky lg:top-8">

                    <!-- Conseils -->
                    <div class="bg-surface border border-border
                                rounded-2xl p-5 shadow-sm">

                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-xl
                                        bg-primary-light flex items-center
                                        justify-center text-primary">
                                ✦
                            </div>

                            <div>
                                <h2 class="text-sm font-bold">
                                    Conseils de publication
                                </h2>
                                <p class="text-xs text-text-muted">
                                    Pour une histoire réussie
                                </p>
                            </div>
                        </div>

                        <ul class="space-y-4">
                            <li class="flex gap-3">
                                <span class="text-primary font-bold">01</span>
                                <div>
                                    <p class="text-sm font-semibold">
                                        Un titre accrocheur
                                    </p>
                                    <p class="text-xs text-text-muted mt-1
                                              leading-relaxed">
                                        Donne envie aux autres étudiants
                                        de découvrir ton histoire.
                                    </p>
                                </div>
                            </li>

                            <li class="flex gap-3">
                                <span class="text-primary font-bold">02</span>
                                <div>
                                    <p class="text-sm font-semibold">
                                        Reste authentique
                                    </p>
                                    <p class="text-xs text-text-muted mt-1
                                              leading-relaxed">
                                        Partage ton expérience avec tes
                                        propres mots.
                                    </p>
                                </div>
                            </li>

                            <li class="flex gap-3">
                                <span class="text-primary font-bold">03</span>
                                <div>
                                    <p class="text-sm font-semibold">
                                        Respecte la communauté
                                    </p>
                                    <p class="text-xs text-text-muted mt-1
                                              leading-relaxed">
                                        Évite les contenus offensants
                                        ou les informations privées.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- Informations -->
                    <div class="rounded-2xl bg-primary-light
                                border border-primary/10 p-5">
                        <p class="text-sm font-bold text-primary">
                            💜 IUT Stories
                        </p>

                        <p class="text-xs text-text-main/80 mt-2 leading-relaxed">
                            Un espace pour partager les expériences,
                            les souvenirs et les anecdotes qui font
                            la vie étudiante.
                        </p>
                    </div>

                </aside>
            </form>
        </div>
    </main>
</template>
