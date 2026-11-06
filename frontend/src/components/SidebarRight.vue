<script setup>
import { Folder, TrendingUp, MessageSquare } from '@lucide/vue'

defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  topArticles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['openArticle'])
</script>

<template>
  <aside class="hidden lg:block">
    <div class="sticky top-[146px] space-y-6">

      <!-- WIDGET 1 : CATEGORIES DYNAMIQUES -->
      <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <h3 class="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-text-light">
          <Folder :size="16" />
          CATÉGORIES DE L'IUT
        </h3>
        
        <div v-if="categories.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="rounded-lg bg-bg px-3 py-1.5 text-xs font-medium text-text-muted transition hover:bg-primary-light hover:text-primary"
          >
            {{ cat.name }}
          </button>
        </div>
        <p v-else class="text-xs text-text-muted">
          Chargement des catégories...
        </p>
      </div>

      <!-- WIDGET 2 : PUBLICATIONS LES PLUS DISCUTEES -->
      <div class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <h3 class="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-text-light">
          <TrendingUp :size="16" />
          LES PLUS DISCUTEES
        </h3>

        <div class="space-y-3">
          <div
            v-for="article in topArticles"
            :key="article.id"
            @click="emit('openArticle', article)"
            class="group cursor-pointer border-b border-border pb-3 last:border-b-0 last:pb-0"
          >
            <p class="text-xs font-semibold text-text-main group-hover:text-primary line-clamp-2">
              {{ article.title }}
            </p>
            <p class="mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
              <MessageSquare :size="13" />
              {{ article.comments_count || 0 }} commentaires
            </p>
          </div>
        </div>
      </div>

      <!-- FOOTER / INFOS -->
      <div class="px-3 text-xs leading-5 text-text-light">
        <p class="font-extrabold tracking-wider text-primary">LapiUT</p>
        <p>La plateforme officielle des anecdotes et du partage étudiant à l'IUT.</p>
      </div>

    </div>
  </aside>
</template>
