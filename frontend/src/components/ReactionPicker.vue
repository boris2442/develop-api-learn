<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'react'])

const showPicker = ref(false)
let hideTimeout = null

const availableReactions = [
  { id: 'like', name: 'J\'aime', emoji: '👍' },
  { id: 'love', name: 'J\'adore', emoji: '❤️' },
  { id: 'grad', name: 'Brillant', emoji: '🎓' },
  { id: 'laugh', name: 'Haha', emoji: '😂' },
  { id: 'idea', name: 'Pertinent', emoji: '💡' },
  { id: 'sad', name: 'Triste', emoji: '😭' },
]

const show = () => {
  clearTimeout(hideTimeout)
  showPicker.value = true
}

const hideWithDelay = () => {
  hideTimeout = setTimeout(() => {
    showPicker.value = false
  }, 250)
}

const select = (reaction) => {
  emit('update:modelValue', reaction)
  emit('react', reaction)
  showPicker.value = false
}

const toggleDefault = () => {
  if (props.modelValue) {
    emit('update:modelValue', null)
    emit('react', null)
  } else {
    emit('update:modelValue', availableReactions[0])
    emit('react', availableReactions[0])
  }
}
</script>

<template>
  <div 
    class="relative flex justify-center"
    @mouseenter="show"
    @mouseleave="hideWithDelay"
  >
    <!-- Bulle flottante des émojis au survol -->
    <div 
      v-if="showPicker"
      class="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-xl border border-border transition-all duration-300 transform scale-100 z-50 animate-fade-in"
    >
      <button 
        v-for="reaction in availableReactions" 
        :key="reaction.id"
        @click="select(reaction)"
        class="text-xl transition-transform hover:scale-125 focus:outline-none"
        :title="reaction.name"
      >
        {{ reaction.emoji }}
      </button>
    </div>

    <!-- Bouton principal -->
    <button
      type="button"
      @click="toggleDefault"
      class="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-text-muted transition hover:bg-bg hover:text-primary"
    >
      <span class="text-base">{{ modelValue ? modelValue.emoji : '👍' }}</span>
      <span :class="modelValue ? 'text-primary font-bold' : ''">
        {{ modelValue ? modelValue.name : "J'aime" }}
      </span>
    </button>
  </div>
</template>
