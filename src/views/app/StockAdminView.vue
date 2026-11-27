<template>
  <div>
    <PageHeader
      :title="t('stockAdmin.title')"
      :subtitle="t('stockAdmin.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('stockAdmin.title') }]"
    >
      <template #action>
        <button
          type="button"
          class="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="open = true"
        >
          <IconBase name="plus" :size="16" />
          {{ t('stockAdmin.new') }}
        </button>
      </template>
    </PageHeader>

    <FilterBar v-model:search="term" :search-placeholder="t('stockAdmin.searchPlaceholder')">
      <FilterSelect v-model:value="state" :label="t('common.status')">
        <option value="">{{ t('common.all') }}</option>
        <option v-for="s in STATES" :key="s" :value="s">{{ t(`status.stock.${s}`) }}</option>
      </FilterSelect>
      <label class="flex items-center gap-2 text-sm text-muted">
        <input v-model="onlySlow" type="checkbox" class="h-4 w-4 rounded border-themed accent-brand-500" />
        {{ t('stockAdmin.onlySlow') }}
      </label>
    </FilterBar>

    <DataTable v-if="rows.length" :columns="columns" :data="rows" :page-size="12" :searchable="false" />
    <div v-else class="surface-card rounded-2xl border">
      <EmptyState icon="car" :title="t('stockAdmin.empty')" :description="t('stockAdmin.emptyDesc')" />
    </div>

    <ModalBase :open="open" :title="t('stockAdmin.form.title')" size="xl" @close="open = false">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-model">
            {{ t('stockAdmin.form.model') }}
          </label>
          <select
            id="v-model"
            :value="form.modelId"
            :class="control"
            @change="form.modelId = Number(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="m in dealer.models" :key="m.id" :value="m.id">
              {{ brandById(dealer.brands, m.brandId)?.name }} {{ m.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-version">
            {{ t('stockAdmin.form.version') }}
          </label>
          <input id="v-version" v-model="form.version" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-color">
            {{ t('stockAdmin.form.color') }}
          </label>
          <input id="v-color" v-model="form.color" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-year">
            {{ t('stockAdmin.form.year') }}
          </label>
          <input id="v-year" v-model.number="form.year" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-myear">
            {{ t('stockAdmin.form.modelYear') }}
          </label>
          <input id="v-myear" v-model.number="form.modelYear" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-km">
            {{ t('stockAdmin.form.km') }}
          </label>
          <input id="v-km" v-model.number="form.km" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-tr">
            {{ t('stockAdmin.form.transmission') }}
          </label>
          <select id="v-tr" v-model="form.transmission" :class="control">
            <option v-for="tr in TRANSMISSIONS" :key="tr" :value="tr">{{ t(`spec.transmission.${tr}`) }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-fuel">
            {{ t('stockAdmin.form.fuel') }}
          </label>
          <select id="v-fuel" v-model="form.fuel" :class="control">
            <option v-for="f in FUELS" :key="f" :value="f">{{ t(`spec.fuel.${f}`) }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-doors">
            {{ t('stockAdmin.form.doors') }}
          </label>
          <input id="v-doors" v-model.number="form.doors" type="number" :min="2" :max="5" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-plate">
            {{ t('stockAdmin.form.plateEnd') }}
          </label>
          <input id="v-plate" v-model="form.plateEnd" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-acq">
            {{ t('stockAdmin.form.acquisitionCost') }}
          </label>
          <input id="v-acq" v-model.number="form.acquisitionCost" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-prep">
            {{ t('stockAdmin.form.prepCost') }}
          </label>
          <input id="v-prep" v-model.number="form.prepCost" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-price">
            {{ t('stockAdmin.form.price') }}
          </label>
          <input id="v-price" v-model.number="form.price" type="number" :class="control" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="v-state">
            {{ t('stockAdmin.form.state') }}
          </label>
          <select id="v-state" v-model="form.state" :class="control">
            <option v-for="s in STATES" :key="s" :value="s">{{ t(`status.stock.${s}`) }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4">
        <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('vehicle.options') }}</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in OPTION_CATALOG"
            :key="opt"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
            :class="
              form.options.includes(opt)
                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'border-themed text-muted hover:text-body'
            "
            @click="toggleOption(opt)"
          >
            <IconBase v-if="form.options.includes(opt)" name="check" :size="12" :stroke-width="2.5" />
            {{ opt }}
          </button>
        </div>
      </div>

      <p
        class="mt-4 rounded-xl border p-3.5 text-sm"
        :class="
          formMargin < 0
            ? 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500'
            : 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-500'
        "
      >
        {{
          t('stockAdmin.form.marginPreview', {
            value: formatCurrency(formMargin, locale),
            pct: formatPercent(formMarginPct, locale),
          })
        }}
      </p>

      <template #footer>
        <button
          type="button"
          class="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
          @click="open = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="submit"
        >
          {{ t('common.save') }}
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import { OPTION_CATALOG } from '@/data/mock'
import {
  brandById,
  daysInStock,
  filterStock,
  margin,
  marginPct,
  slowMovers,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StockPill from '@/components/dl/StockPill.vue'
import type { Fuel, StockState, Transmission, Vehicle } from '@/data/types'

const STATES: StockState[] = ['disponivel', 'reservado', 'vendido', 'preparacao']
const TRANSMISSIONS: Transmission[] = ['manual', 'automatico', 'cvt', 'automatizado']
const FUELS: Fuel[] = ['flex', 'gasolina', 'diesel', 'hibrido', 'eletrico']

const { t, locale } = useI18n()
usePageTitle(() => t('stockAdmin.title'))
const now = useNow()

const route = useRoute()
const router = useRouter()
const dealer = useDealerStore()
const ui = useUiStore()

const term = ref('')
const state = ref('')
const onlySlow = ref(route.query.giro === 'lento')
const open = ref(route.query.novo === '1')

const currentYear = new Date(now.value).getFullYear()

const form = reactive({
  modelId: dealer.models[0]?.id ?? 1,
  version: '1.0 Turbo',
  year: currentYear - 2,
  modelYear: currentYear - 1,
  km: 24000,
  color: 'Branco',
  plateEnd: '7',
  transmission: 'automatico' as Transmission,
  fuel: 'flex' as Fuel,
  doors: 4,
  acquisitionCost: 62000,
  prepCost: 2400,
  price: 74900,
  state: 'preparacao' as StockState,
  options: ['Ar-condicionado', 'Central multimídia'] as string[],
})

const slowIds = computed(() => new Set(slowMovers(dealer.vehicles, now.value, dealer.rules).map((row) => row.vehicle.id)))

const rows = computed(() => {
  let list = filterStock(dealer.vehicles, dealer.models, dealer.brands, { term: term.value })
  if (state.value) list = list.filter((v) => v.state === state.value)
  if (onlySlow.value) list = list.filter((v) => slowIds.value.has(v.id))
  return [...list].sort((a, b) => daysInStock(b, now.value) - daysInStock(a, now.value))
})

const columns = computed<ColumnDef<Vehicle, any>[]>(() => [
  {
    id: 'vehicle',
    header: t('stockAdmin.columns.vehicle'),
    cell: ({ row }) =>
      h(
        RouterLink,
        { to: `/app/veiculo/${row.original.id}`, class: 'font-medium text-heading hover:text-brand-600' },
        () => vehicleLabel(dealer.models, dealer.brands, row.original)
      ),
  },
  { id: 'year', header: t('stockAdmin.columns.year'), cell: ({ row }) => yearLabel(row.original) },
  {
    id: 'km',
    header: t('stockAdmin.columns.km'),
    cell: ({ row }) => `${formatNumber(row.original.km, locale.value)} km`,
  },
  {
    id: 'cost',
    header: t('stockAdmin.columns.cost'),
    cell: ({ row }) => formatCurrency(row.original.acquisitionCost + row.original.prepCost, locale.value),
  },
  {
    id: 'price',
    header: t('stockAdmin.columns.price'),
    cell: ({ row }) =>
      h('span', { class: 'font-medium text-heading' }, formatCurrency(row.original.price, locale.value)),
  },
  {
    id: 'margin',
    header: t('stockAdmin.columns.margin'),
    cell: ({ row }) => {
      const value = margin(row.original, row.original.price)
      return h(
        'span',
        {
          class:
            value < 0
              ? 'font-medium text-error-600 dark:text-error-500'
              : 'font-medium text-success-600 dark:text-success-500',
        },
        [
          formatCurrency(value, locale.value),
          h(
            'span',
            { class: 'ml-1 text-xs font-normal text-muted' },
            formatPercent(marginPct(row.original, row.original.price), locale.value)
          ),
        ]
      )
    },
  },
  {
    id: 'days',
    header: t('stockAdmin.columns.days'),
    cell: ({ row }) => {
      const days = daysInStock(row.original, now.value)
      const slow = slowIds.value.has(row.original.id)
      return h(
        'span',
        { class: slow ? 'font-semibold text-warning-600 dark:text-warning-500' : '' },
        t('common.daysCount', { count: days }, days)
      )
    },
  },
  {
    id: 'state',
    header: t('stockAdmin.columns.state'),
    cell: ({ row }) => h(StockPill, { state: row.original.state }),
  },
])

const formMargin = computed(() => form.price - form.acquisitionCost - form.prepCost)
const formMarginPct = computed(() => (form.price > 0 ? formMargin.value / form.price : 0))

function toggleOption(opt: string) {
  form.options = form.options.includes(opt) ? form.options.filter((o) => o !== opt) : [...form.options, opt]
}

function submit() {
  dealer.saveVehicle({ ...form })
  open.value = false
  router.replace({ path: '/app/estoque' })
  ui.notifySuccess(t('stockAdmin.saved'))
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
