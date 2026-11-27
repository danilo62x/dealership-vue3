<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-6">
      <h1 class="text-title-sm font-bold text-heading">{{ t('stock.title') }}</h1>
      <p class="mt-1 text-sm text-muted">{{ t('stock.subtitle') }}</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
      <!-- ---- Filtros ---- -->
      <aside class="surface-card h-fit rounded-2xl border p-5">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-heading">
            <IconBase name="filter" :size="16" />
            {{ t('common.filters') }}
          </h2>
          <button type="button" class="text-xs font-medium text-brand-500 hover:text-brand-600" @click="clear">
            {{ t('common.clearFilters') }}
          </button>
        </div>

        <div class="mt-4 space-y-3.5">
          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-term">{{ t('common.search') }}</label>
            <input id="f-term" v-model="term" :placeholder="t('stock.searchPlaceholder')" :class="control" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-brand">{{ t('stock.brand') }}</label>
            <select id="f-brand" v-model="brandId" :class="control">
              <option value="">{{ t('common.all') }}</option>
              <option v-for="b in dealer.brands" :key="b.id" :value="String(b.id)">{{ b.name }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-model">{{ t('stock.model') }}</label>
            <select id="f-model" v-model="category" :class="control" :aria-label="t('stock.category')">
              <option value="">{{ t('common.all') }}</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ t(`spec.category.${c}`) }}</option>
            </select>
            <p class="mt-1 text-[11px] text-muted">
              {{ t('common.vehiclesCount', { count: brandModels.length }, brandModels.length) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-muted" for="f-year">{{ t('stock.yearMin') }}</label>
              <select id="f-year" v-model="yearMin" :class="control">
                <option value="">{{ t('common.all') }}</option>
                <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-muted" for="f-km">{{ t('stock.kmMax') }}</label>
              <select id="f-km" v-model="kmMax" :class="control">
                <option value="">{{ t('common.all') }}</option>
                <option v-for="k in KM_STEPS" :key="k" :value="String(k)">{{ formatNumber(k, locale) }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-price">{{ t('stock.priceMax') }}</label>
            <select id="f-price" v-model="priceMax" :class="control">
              <option value="">{{ t('common.all') }}</option>
              <option v-for="p in PRICE_STEPS" :key="p" :value="String(p)">{{ formatCurrency(p, locale) }}</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-tr">{{ t('stock.transmission') }}</label>
            <select id="f-tr" v-model="transmission" :class="control">
              <option value="">{{ t('common.all') }}</option>
              <option v-for="tr in TRANSMISSIONS" :key="tr" :value="tr">{{ t(`spec.transmission.${tr}`) }}</option>
            </select>
          </div>

          <div>
            <span class="mb-1 block text-xs font-medium text-muted">{{ t('stock.fuel') }}</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="f in FUELS"
                :key="f"
                type="button"
                class="rounded-full transition"
                :class="fuel === f ? 'ring-2 ring-brand-500' : 'opacity-70 hover:opacity-100'"
                @click="fuel = fuel === f ? '' : f"
              >
                <FuelBadge :fuel="f" />
              </button>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-muted" for="f-color">{{ t('stock.color') }}</label>
            <select id="f-color" v-model="color" :class="control">
              <option value="">{{ t('common.all') }}</option>
              <option v-for="c in colors" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- ---- Resultados ---- -->
      <div class="min-w-0">
        <div class="surface-card mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
          <p class="text-sm text-muted">
            {{ t('common.resultsCount', { count: filtered.length }, filtered.length) }}
          </p>
          <div class="flex items-center gap-2">
            <select
              v-model="sort"
              :aria-label="t('common.sortBy')"
              class="focus-ring rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
            >
              <option v-for="s in SORTS" :key="s.value" :value="s.value">{{ t(s.key) }}</option>
            </select>
            <div class="flex overflow-hidden rounded-lg border border-themed">
              <button
                type="button"
                :aria-label="t('common.grid')"
                class="flex h-9 w-9 items-center justify-center"
                :class="ui.stockView === 'grid' ? 'bg-brand-500 text-white' : 'text-muted'"
                @click="ui.setStockView('grid')"
              >
                <IconBase name="grid" :size="16" />
              </button>
              <button
                type="button"
                :aria-label="t('common.list')"
                class="flex h-9 w-9 items-center justify-center"
                :class="ui.stockView === 'list' ? 'bg-brand-500 text-white' : 'text-muted'"
                @click="ui.setStockView('list')"
              >
                <IconBase name="list" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <template v-if="pageItems.length">
          <div :class="ui.stockView === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4 sm:grid-cols-2'">
            <VehicleCard
              v-for="vehicle in pageItems"
              :key="vehicle.id"
              :vehicle="vehicle"
              :compact="ui.stockView === 'list'"
            />
          </div>
          <div class="mt-8">
            <Pagination :page="page" :total-pages="totalPages" @change="page = $event" />
          </div>
        </template>
        <div v-else class="surface-card rounded-2xl border">
          <EmptyState icon="car" :title="t('stock.empty')" :description="t('stock.emptyDesc')">
            <template #action>
              <button
                type="button"
                class="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
                @click="clear"
              >
                {{ t('common.clearFilters') }}
              </button>
            </template>
          </EmptyState>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { availableStock, filterStock, sortStock } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Pagination from '@/components/ui/Pagination.vue'
import VehicleCard from '@/components/dl/VehicleCard.vue'
import FuelBadge from '@/components/dl/FuelBadge.vue'
import type { Fuel, ModelCategory, StockSort, Transmission } from '@/data/types'

const PAGE_SIZE = 12
const CATEGORIES: ModelCategory[] = ['hatch', 'sedan', 'suv', 'picape', 'utilitario']
const TRANSMISSIONS: Transmission[] = ['manual', 'automatico', 'cvt', 'automatizado']
const FUELS: Fuel[] = ['flex', 'gasolina', 'diesel', 'hibrido', 'eletrico']
const PRICE_STEPS = [50000, 80000, 110000, 150000, 220000]
const KM_STEPS = [20000, 50000, 80000, 120000]

const SORTS: { value: StockSort; key: string }[] = [
  { value: 'recent', key: 'stock.sort.recent' },
  { value: 'price-asc', key: 'stock.sort.priceAsc' },
  { value: 'price-desc', key: 'stock.sort.priceDesc' },
  { value: 'km-asc', key: 'stock.sort.kmAsc' },
  { value: 'year-desc', key: 'stock.sort.yearDesc' },
]

const { t, locale } = useI18n()
usePageTitle(() => t('stock.title'))

const route = useRoute()
const router = useRouter()
const dealer = useDealerStore()
const ui = useUiStore()

const asParam = (value: unknown) => (typeof value === 'string' ? value : '')

const term = ref('')
const brandId = ref(asParam(route.query.marca))
const category = ref(asParam(route.query.segmento))
const transmission = ref('')
const fuel = ref('')
const color = ref('')
const yearMin = ref('')
const priceMax = ref(asParam(route.query.preco))
const kmMax = ref('')
const sort = ref<StockSort>('recent')
const page = ref(1)

watch(
  () => route.query,
  (query) => {
    brandId.value = asParam(query.marca)
    category.value = asParam(query.segmento)
    priceMax.value = asParam(query.preco)
  }
)

const showcase = computed(() => availableStock(dealer.vehicles))
const colors = computed(() => Array.from(new Set(showcase.value.map((v) => v.color))).sort())
const years = computed(() => Array.from(new Set(showcase.value.map((v) => v.modelYear))).sort((a, b) => b - a))
const brandModels = computed(() =>
  brandId.value ? dealer.models.filter((m) => m.brandId === Number(brandId.value)) : dealer.models
)

const filtered = computed(() =>
  sortStock(
    filterStock(showcase.value, dealer.models, dealer.brands, {
      term: term.value,
      brandId: brandId.value ? Number(brandId.value) : null,
      category: category.value,
      transmission: transmission.value,
      fuel: fuel.value,
      color: color.value,
      yearMin: yearMin.value ? Number(yearMin.value) : null,
      priceMax: priceMax.value ? Number(priceMax.value) : null,
      kmMax: kmMax.value ? Number(kmMax.value) : null,
    }),
    sort.value
  )
)

watch(
  () => [term.value, brandId.value, category.value, transmission.value, fuel.value, color.value, yearMin.value, priceMax.value, kmMax.value, sort.value],
  () => {
    page.value = 1
  }
)

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageItems = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function clear() {
  term.value = ''
  brandId.value = ''
  category.value = ''
  transmission.value = ''
  fuel.value = ''
  color.value = ''
  yearMin.value = ''
  priceMax.value = ''
  kmMax.value = ''
  router.replace({ path: '/estoque' })
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body'
</script>
