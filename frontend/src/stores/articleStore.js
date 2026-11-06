
import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../api/index.js'

// import { defineStore } from 'pinia'
// import { ref } from 'vue'
// import apiClient from '@/services/apiClient'

export const useArticleStore = defineStore('article', () => {

    // État
    const articles = ref([])

    const loading = ref(false)
    const loadingMore = ref(false)

    const error = ref(null)

    const currentPage = ref(1)
    const lastPage = ref(1)

    const articlesLoaded = ref(false)


    /**
     * Charger les articles
     *
     * @param {number} page
     * @param {boolean} force
     */
    const fetchArticles = async (page = 1, force = false) => {

        // Empêcher plusieurs requêtes simultanées
        if (loading.value || loadingMore.value) {
            return
        }

        // Éviter de recharger inutilement la première page
        if (articlesLoaded.value && page === 1 && !force) {
            return
        }

        // Vérifier si la page demandée existe
        if (page > lastPage.value && articlesLoaded.value) {
            return
        }

        // Respecter l'ordre de pagination
        if (page > 1 && page !== currentPage.value + 1) {
            return
        }

        const isFirstPage = page === 1

        // Mettre à jour les états de chargement
        if (isFirstPage) {
            loading.value = true
        } else {
            loadingMore.value = true
        }

        error.value = null

        try {

            // Requête API
            const response = await apiClient.get('/api/articles', {
                params: {
                    page: page
                }
            })

            // Récupérer les articles
            const newArticles = response.data.data

            // Récupérer les informations de pagination
            const pagination = response.data.meta

            // Première page : remplacer les articles
            if (isFirstPage) {

                articles.value = newArticles

            } else {

                // Pages suivantes : éviter les doublons
                const existingIds = new Set(
                    articles.value.map(article => article.id)
                )

                const uniqueArticles = newArticles.filter(
                    article => !existingIds.has(article.id)
                )

                // Ajouter les nouveaux articles
                articles.value.push(...uniqueArticles)
            }

            // Mettre à jour la pagination
            currentPage.value = pagination.current_page
            lastPage.value = pagination.last_page

            articlesLoaded.value = true

        } catch (err) {

            console.error(
                'Erreur de chargement des articles :',
                err
            )

            error.value = "Impossible de charger les articles."

        } finally {

            // Réinitialiser les états de chargement
            loading.value = false
            loadingMore.value = false
        }
    }


    /**
     * Charger la page suivante
     */
    const loadMoreArticles = async () => {

        if (
            loading.value ||
            loadingMore.value ||
            currentPage.value >= lastPage.value ||
            !articles.value.length
        ) {
            return
        }

        await fetchArticles(currentPage.value + 1)
    }


    /**
     * Actualiser le fil d'actualité
     */
    const refreshArticles = async () => {

        await fetchArticles(1, true)
    }


    /**
     * Réinitialiser le store
     */
    const resetArticles = () => {

        articles.value = []

        currentPage.value = 1
        lastPage.value = 1

        loading.value = false
        loadingMore.value = false

        error.value = null

        articlesLoaded.value = false
    }


    return {
        // États
        articles,
        loading,
        loadingMore,
        error,
        currentPage,
        lastPage,
        articlesLoaded,

        // Actions
        fetchArticles,
        loadMoreArticles,
        refreshArticles,
        resetArticles
    }

})





// export const useArticleStore = defineStore('article', () => {
//   const articles = ref([])
//   const loading = ref(false)
//   const loadingMore = ref(false)
//   const error = ref(null)

//   const currentPage = ref(1)
//   const lastPage = ref(1)
//   const articlesLoaded = ref(false)

//   const fetchArticles = async (page = 1, force = false) => {
//     // Empêcher les requêtes simultanées
//     if (loading.value || loadingMore.value) return

//     // Éviter de recharger inutilement la première page
//     if (articlesLoaded.value && page === 1 && !force) return

//     // Ne pas dépasser la dernière page
//     if (page > lastPage.value && articlesLoaded.value) return

//     if (page > 1 && page !== currentPage.value + 1) return

//     const isFirstPage = page === 1

//     if (isFirstPage) {
//       loading.value = true
//     } else {
//       loadingMore.value = true
//     }

//     error.value = null

//     try {
//       const response = await apiClient.get('/api/articles', {
//         params: { page }
//       })

//       const newArticles = response.data.data

//       if (isFirstPage) {
//         articles.value = newArticles
//       } else {
//         // Ajouter uniquement les articles qui ne sont pas déjà présents
//         const existingIds = new Set(
//           articles.value.map(article => article.id)
//         )

//         const uniqueArticles = newArticles.filter(
//           article => !existingIds.has(article.id)
//         )

//         articles.value.push(...uniqueArticles)
//       }

//       currentPage.value = response.data.current_page
//       lastPage.value = response.data.last_page
//       articlesLoaded.value = true

//     } catch (err) {
//       console.error('Erreur de chargement des articles :', err)
//       error.value = "Impossible de charger les articles."
//     } finally {
//       loading.value = false
//       loadingMore.value = false
//     }
//   }

//   const refreshArticles = () => {
//     return fetchArticles(1, true)
//   }

//   return {
//     articles,
//     loading,
//     loadingMore,
//     error,
//     currentPage,
//     lastPage,
//     articlesLoaded,
//     fetchArticles,
//     refreshArticles
//   }
// })
