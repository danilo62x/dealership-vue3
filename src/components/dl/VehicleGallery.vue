<template>
  <div>
    <div class="relative overflow-hidden rounded-2xl border border-themed">
      <img :src="dlImage(list[current], 1200, 800)" :alt="alt" class="aspect-[3/2] w-full object-cover" />
      <template v-if="list.length > 1">
        <button
          type="button"
          :aria-label="t('common.previous')"
          class="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
          @click="index = (current - 1 + list.length) % list.length"
        >
          <IconBase name="chevron-left" :size="18" />
        </button>
        <button
          type="button"
          :aria-label="t('common.next')"
          class="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:text-gray-100"
          @click="index = (current + 1) % list.length"
        >
          <IconBase name="chevron-right" :size="18" />
        </button>
        <span class="absolute right-3 bottom-3 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white">
          {{ current + 1 }}/{{ list.length }}
        </span>
      </template>
    </div>

    <div v-if="list.length > 1" class="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
      <button
        v-for="(seed, i) in list"
        :key="seed"
        type="button"
        :aria-label="`${t('vehicle.gallery')} ${i + 1}`"
        class="shrink-0 overflow-hidden rounded-xl border-2 transition"
        :class="i === current ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'"
        @click="index = i"
      >
        <img :src="dlImage(seed, 200, 150)" alt="" class="h-16 w-24 object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { dlImage } from '@/data/mock'
import IconBase from '@/components/ui/IconBase.vue'

/** Galeria do veículo: foto grande e miniaturas clicáveis. */
const props = defineProps<{
  seeds: string[]
  alt: string
}>()

const { t } = useI18n()
const index = ref(0)

const list = computed(() => (props.seeds.length ? props.seeds : ['veiculo-sem-foto']))
const current = computed(() => Math.min(index.value, list.value.length - 1))

watch(
  () => props.seeds,
  () => {
    index.value = 0
  }
)
</script>
