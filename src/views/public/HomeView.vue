<template>
  <div>
    <!-- ---- Vitrine em destaque ---- -->
    <section class="relative isolate overflow-hidden border-b border-themed">
      <img :src="dlImage(STORE.coverSeed, 1600, 900)" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />

      <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div class="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div class="min-w-0">
            <p
              class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur"
            >
              <IconBase name="shield-check" :size="13" />
              {{ t('home.hero.eyebrow') }}
            </p>
            <h1 class="mt-5 text-3xl font-bold text-white sm:text-title-md lg:text-title-lg">
              {{ t('home.hero.title') }}
            </h1>
            <p class="mt-4 max-w-2xl text-base text-white/80">{{ t('home.hero.subtitle') }}</p>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
              <span class="inline-flex items-center gap-1.5">
                <IconBase name="car" :size="15" />
                {{ formatNumber(showcase.length, locale) }} {{ t('home.hero.available') }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <IconBase name="tag" :size="15" />
                {{ formatNumber(dealer.brands.length, locale) }} {{ t('home.hero.brands') }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <IconBase name="dollar" :size="15" />
                {{ t('home.hero.fromPrice') }} {{ formatCurrency(cheapest, locale) }}
              </span>
            </div>

            <div class="mt-7 flex flex-wrap items-center gap-3">
              <RouterLink
                to="/estoque"
                class="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <IconBase name="car" :size="16" />
                {{ t('home.hero.cta') }}
              </RouterLink>
              <RouterLink
                to="/financiamento"
                class="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {{ t('home.hero.secondary') }}
              </RouterLink>
            </div>
          </div>

          <!-- ---- Busca rápida ---- -->
          <div class="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p class="text-xs tracking-wider text-white/60 uppercase">{{ t('home.quick.title') }}</p>
            <div class="mt-4 space-y-3">
              <div>
                <label class="mb-1 block text-xs text-white/70" for="q-brand">{{ t('home.quick.brand') }}</label>
                <select id="q-brand" v-model="brandId" :class="`${control} border-white/20 text-white`">
                  <option value="" class="text-gray-900">{{ t('home.quick.anyBrand') }}</option>
                  <option v-for="b in dealer.brands" :key="b.id" :value="String(b.id)" class="text-gray-900">
                    {{ b.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs text-white/70" for="q-cat">{{ t('home.quick.category') }}</label>
                <select id="q-cat" v-model="category" :class="`${control} border-white/20 text-white`">
                  <option value="" class="text-gray-900">{{ t('home.quick.anyCategory') }}</option>
                  <option v-for="c in CATEGORIES" :key="c.key" :value="c.key" class="text-gray-900">
                    {{ t(`spec.category.${c.key}`) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs text-white/70" for="q-price">{{ t('home.quick.priceMax') }}</label>
                <select id="q-price" v-model="priceMax" :class="`${control} border-white/20 text-white`">
                  <option value="" class="text-gray-900">{{ t('home.quick.anyPrice') }}</option>
                  <option v-for="p in PRICE_STEPS" :key="p" :value="String(p)" class="text-gray-900">
                    {{ formatCurrency(p, locale) }}
                  </option>
                </select>
              </div>

              <button
                type="button"
                class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
                @click="search"
              >
                <IconBase name="search" :size="16" />
                {{ t('home.quick.cta') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ---- Destaques da semana ---- -->
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-title-sm font-bold text-heading">{{ t('home.highlights.title') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('home.highlights.subtitle') }}</p>
        </div>
        <RouterLink
          to="/estoque"
          class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          {{ t('common.viewAll') }}
          <IconBase name="arrow-right" :size="15" />
        </RouterLink>
      </div>

      <div v-if="highlights.length" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <VehicleCard v-for="vehicle in highlights" :key="vehicle.id" :vehicle="vehicle" />
      </div>
      <div v-else class="surface-card mt-6 rounded-2xl border">
        <EmptyState icon="car" :title="t('stock.empty')" :description="t('stock.emptyDesc')" />
      </div>
    </section>

    <!-- ---- Chegou agora ---- -->
    <section class="border-y border-themed bg-gray-50 py-14 dark:bg-gray-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-title-sm font-bold text-heading">{{ t('home.arrivals.title') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('home.arrivals.subtitle') }}</p>
        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <VehicleCard v-for="vehicle in arrivals.slice(0, 4)" :key="vehicle.id" :vehicle="vehicle" compact />
        </div>
      </div>
    </section>

    <!-- ---- Por categoria ---- -->
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 class="text-title-sm font-bold text-heading">{{ t('home.categories.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('home.categories.subtitle') }}</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <RouterLink
          v-for="cat in CATEGORIES"
          :key="cat.key"
          :to="`/estoque?segmento=${cat.key}`"
          class="surface-card group flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-theme-md"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/15"
          >
            <IconBase :name="cat.icon" :size="20" />
          </span>
          <span class="min-w-0">
            <span class="block truncate font-semibold text-heading">{{ t(`spec.category.${cat.key}`) }}</span>
            <span class="block text-xs text-muted">
              {{ t('common.vehiclesCount', { count: countOf(cat.key) }, countOf(cat.key)) }}
            </span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- ---- Por que comprar aqui ---- -->
    <section class="border-t border-themed bg-gray-50 py-14 dark:bg-gray-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-title-sm font-bold text-heading">{{ t('home.why.title') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('home.why.subtitle') }}</p>

        <div class="mt-6 grid gap-4 lg:grid-cols-3">
          <div v-for="item in WHY" :key="item.key" class="surface-card rounded-2xl border p-5">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
            >
              <IconBase :name="item.icon" :size="20" />
            </span>
            <h3 class="mt-4 font-semibold text-heading">{{ t(`home.why.${item.key}.title`) }}</h3>
            <p class="mt-1.5 text-sm text-muted">{{ t(`home.why.${item.key}.text`) }}</p>
          </div>
        </div>

        <!-- ---- Chamada da troca ---- -->
        <div
          class="surface-card mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center md:p-8"
        >
          <div class="min-w-0">
            <h3 class="text-lg font-semibold text-heading">{{ t('home.sell.title') }}</h3>
            <p class="mt-1 max-w-xl text-sm text-muted">{{ t('home.sell.text') }}</p>
          </div>
          <RouterLink
            to="/vender-meu-carro"
            class="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <IconBase name="calculator" :size="16" />
            {{ t('home.sell.cta') }}
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { dlImage, STORE } from '@/data/mock'
import { availableStock, countByCategory, freshArrivals, weeklyHighlights } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import VehicleCard from '@/components/dl/VehicleCard.vue'
import type { ModelCategory } from '@/data/types'

const CATEGORIES: { key: ModelCategory; icon: string }[] = [
  { key: 'hatch', icon: 'car' },
  { key: 'sedan', icon: 'car' },
  { key: 'suv', icon: 'truck' },
  { key: 'picape', icon: 'truck' },
  { key: 'utilitario', icon: 'package' },
]

const WHY = [
  { key: 'a', icon: 'calculator' },
  { key: 'b', icon: 'refresh-cw' },
  { key: 'c', icon: 'calendar' },
]

const PRICE_STEPS = [60000, 90000, 130000, 200000]

const { t, locale } = useI18n()
usePageTitle()
const router = useRouter()
const dealer = useDealerStore()

const showcase = computed(() => availableStock(dealer.vehicles))
const highlights = computed(() => weeklyHighlights(dealer.vehicles, 4))
const arrivals = computed(() => freshArrivals(dealer.vehicles, 8))
const cheapest = computed(() => showcase.value.reduce((min, v) => (v.price < min ? v.price : min), showcase.value[0]?.price ?? 0))

const brandId = ref('')
const category = ref('')
const priceMax = ref('')

const countOf = (key: ModelCategory) => countByCategory(showcase.value, dealer.models, key)

function search() {
  const params = new URLSearchParams()
  if (brandId.value) params.set('marca', brandId.value)
  if (category.value) params.set('segmento', category.value)
  if (priceMax.value) params.set('preco', priceMax.value)
  router.push(`/estoque?${params.toString()}`)
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
