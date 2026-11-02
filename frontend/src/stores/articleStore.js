
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../api/index.js'

export const useArticleStore = defineStore('article', () => {

  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  const currentPage = ref(1)
  const lastPage = ref(1)

  const articlesLoaded = ref(false)

  const fetchArticles = async (page = 1) => {

    // Éviter une nouvelle requête
    // si cette page est déjà chargée
    if (articlesLoaded.value && page === currentPage.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.get(`/api/articles?page=${page}`)

      articles.value = response.data.data
      currentPage.value = response.data.current_page
      lastPage.value = response.data.last_page

      articlesLoaded.value = true

    } catch (err) {
      console.error(err)

      error.value = "Impossible de charger les articles."

    } finally {
      loading.value = false
    }
  }

  return {
    articles,
    loading,
    error,
    currentPage,
    lastPage,
    articlesLoaded,
    fetchArticles
  }
})
