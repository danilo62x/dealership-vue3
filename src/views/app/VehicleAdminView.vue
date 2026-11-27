<template>
  <div v-if="!vehicle" class="surface-card rounded-2xl border">
    <EmptyState icon="car" :title="t('vehicle.notFound')" :description="t('vehicle.notFoundDesc')">
      <template #action>
        <RouterLink
          to="/app/estoque"
          class="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white"
        >
          {{ t('vehicleAdmin.backToList') }}
        </RouterLink>
      </template>
    </EmptyState>
  </div>

  <div v-else>
    <PageHeader
      :title="label"
      :subtitle="`${yearLabel(vehicle)} · ${formatNumber(vehicle.km, locale)} km · ${vehicle.color}`"
      :crumbs="[
        { label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' },
        { label: t('stockAdmin.title'), href: '/app/estoque' },
        { label },
      ]"
    >
      <template #action>
        <RouterLink
          to="/app/estoque"
          class="focus-ring flex h-11 items-center gap-2 rounded-lg border border-themed px-5 text-sm font-medium text-body"
        >
          <IconBase name="arrow-right" :size="16" class-name="rotate-180" />
          {{ t('vehicleAdmin.backToList') }}
        </RouterLink>
      </template>
    </PageHeader>

    <div class="surface-card rounded-2xl border p-5 md:p-6">
      <Tabs v-model="tab" :tabs="tabs">
        <!-- ---- Ficha ---- -->
        <div v-if="tab === 0" class="space-y-5">
          <div class="grid gap-5 lg:grid-cols-[260px_1fr]">
            <img
              :src="dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 520, 360)"
              :alt="label"
              class="aspect-[3/2] w-full rounded-2xl object-cover"
            />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <StockPill :state="vehicle.state" />
                <span class="text-xs text-muted">
                  {{ yearLabel(vehicle) }} · {{ formatNumber(vehicle.km, locale) }} km
                </span>
              </div>
              <p class="mt-3 text-title-sm font-bold text-heading">{{ formatCurrency(vehicle.price, locale) }}</p>
              <p class="mt-1 text-sm text-muted">
                {{ t('vehicle.arrived') }}: {{ formatDate(vehicle.arrivedAt, locale) }} ·
                {{ t('common.daysCount', { count: days }, days) }}
              </p>

              <div class="mt-5">
                <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('common.status') }}</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in STATES"
                    :key="s"
                    type="button"
                    class="focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition"
                    :class="vehicle.state === s ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body'"
                    @click="changeState(s)"
                  >
                    {{ t(`status.stock.${s}`) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <SpecGrid :vehicle="vehicle" />

          <div>
            <h3 class="mb-2 text-sm font-semibold text-heading">{{ t('vehicle.options') }}</h3>
            <ul v-if="vehicle.options.length" class="flex flex-wrap gap-2">
              <li
                v-for="opt in vehicle.options"
                :key="opt"
                class="rounded-full border border-themed px-3 py-1.5 text-xs text-body"
              >
                {{ opt }}
              </li>
            </ul>
            <p v-else class="text-sm text-muted">{{ t('vehicle.noOptions') }}</p>
          </div>
        </div>

        <!-- ---- Custos ---- -->
        <div v-else-if="tab === 1" class="space-y-5">
          <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-themed p-4">
              <dt class="text-xs text-muted">{{ t('vehicleAdmin.costs.acquisition') }}</dt>
              <dd class="mt-1 text-lg font-semibold text-heading">
                {{ formatCurrency(vehicle.acquisitionCost, locale) }}
              </dd>
            </div>
            <div class="rounded-xl border border-themed p-4">
              <dt class="text-xs text-muted">{{ t('vehicleAdmin.costs.prep') }}</dt>
              <dd class="mt-1 text-lg font-semibold text-heading">{{ formatCurrency(vehicle.prepCost, locale) }}</dd>
            </div>
            <div class="rounded-xl border border-themed p-4">
              <dt class="text-xs text-muted">{{ t('vehicleAdmin.costs.totalCost') }}</dt>
              <dd class="mt-1 text-lg font-semibold text-heading">{{ formatCurrency(totalCost, locale) }}</dd>
            </div>
            <div class="rounded-xl border border-themed p-4">
              <dt class="text-xs text-muted">{{ t('vehicleAdmin.costs.price') }}</dt>
              <dd class="mt-1 text-lg font-semibold text-heading">{{ formatCurrency(vehicle.price, locale) }}</dd>
            </div>
          </dl>

          <div class="grid gap-5 lg:grid-cols-2">
            <div class="rounded-2xl border border-themed p-5">
              <h3 class="text-sm font-semibold text-heading">{{ t('vehicleAdmin.costs.margin') }}</h3>
              <p
                class="mt-2 text-title-sm font-bold"
                :class="marginValue < 0 ? 'text-error-600 dark:text-error-500' : 'text-success-600 dark:text-success-500'"
              >
                {{ formatCurrency(marginValue, locale) }}
              </p>
              <p class="mt-1 text-sm text-muted">
                {{ t('vehicleAdmin.costs.marginPct') }}:
                {{ formatPercent(marginPct(vehicle, vehicle.price), locale) }}
              </p>
              <p class="mt-3 font-mono text-xs text-muted">
                {{ formatCurrency(vehicle.price, locale) }} − {{ formatCurrency(vehicle.acquisitionCost, locale) }} −
                {{ formatCurrency(vehicle.prepCost, locale) }}
              </p>
              <p v-if="marginValue < 0" class="mt-3 flex items-center gap-2 text-xs text-error-600 dark:text-error-500">
                <IconBase name="alert-triangle" :size="14" />
                {{ t('vehicleAdmin.costs.loss') }}
              </p>
            </div>

            <div class="rounded-2xl border border-themed p-5">
              <h3 class="text-sm font-semibold text-heading">{{ t('vehicleAdmin.costs.commission') }}</h3>
              <p class="mt-2 text-title-sm font-bold text-brand-600 dark:text-brand-400">
                {{ formatCurrency(commission(marginValue, dealer.rules), locale) }}
              </p>
              <p class="mt-1 text-sm text-muted">
                {{ t('vehicleAdmin.costs.commissionHint', { pct: formatPercent(rate, locale) }) }}
              </p>

              <div class="mt-4 border-t border-themed pt-3">
                <p class="text-xs text-muted">{{ t('vehicle.daysInStock') }}</p>
                <p class="mt-0.5 text-sm font-semibold text-heading">
                  {{ t('common.daysCount', { count: days }, days) }}
                </p>
                <p v-if="suggested > 0" class="mt-1 text-xs text-warning-600 dark:text-warning-500">
                  {{ t('dashboard.suggested') }}: −{{ formatPercent(suggested, locale) }} =
                  {{ formatCurrency(Math.round((vehicle.price * (1 - suggested)) / 100) * 100, locale) }}
                </p>
                <p class="mt-2 text-xs text-muted">{{ t('vehicleAdmin.costs.daysNote') }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-themed p-5">
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-heading" for="c-acq">
                  {{ t('stockAdmin.form.acquisitionCost') }}
                </label>
                <input
                  id="c-acq"
                  type="number"
                  :value="vehicle.acquisitionCost"
                  class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
                  @input="
                    dealer.saveVehicle({ id: vehicle.id, acquisitionCost: Number(($event.target as HTMLInputElement).value) })
                  "
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-heading" for="c-prep">
                  {{ t('stockAdmin.form.prepCost') }}
                </label>
                <input
                  id="c-prep"
                  type="number"
                  :value="vehicle.prepCost"
                  class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
                  @input="
                    dealer.saveVehicle({ id: vehicle.id, prepCost: Number(($event.target as HTMLInputElement).value) })
                  "
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-heading" for="c-price">
                  {{ t('stockAdmin.form.price') }}
                </label>
                <input
                  id="c-price"
                  type="number"
                  :value="vehicle.price"
                  class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body"
                  @input="dealer.saveVehicle({ id: vehicle.id, price: Number(($event.target as HTMLInputElement).value) })"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ---- Propostas ---- -->
        <ul v-else-if="tab === 2 && vehicleDeals.length" class="divide-y divide-themed">
          <li v-for="deal in vehicleDeals" :key="deal.id" class="flex flex-wrap items-center gap-3 py-3">
            <DealStagePill :stage="deal.stage" />
            <RouterLink
              :to="`/app/proposta/${deal.id}`"
              class="min-w-0 flex-1 text-sm font-medium text-heading hover:text-brand-600"
            >
              {{ customerById(dealer.customers, deal.customerId)?.name ?? '—' }}
            </RouterLink>
            <span class="text-xs text-muted">{{ sellerById(dealer.sellers, deal.sellerId)?.name ?? '—' }}</span>
            <span class="text-sm font-semibold text-heading">{{ formatCurrency(dealPrice(deal, vehicle), locale) }}</span>
            <span class="text-xs text-muted">{{ formatDate(deal.movedAt, locale) }}</span>
          </li>
        </ul>
        <EmptyState v-else-if="tab === 2" icon="handshake" :title="t('vehicleAdmin.noDeals')" />

        <!-- ---- Test-drives ---- -->
        <ul v-else-if="tab === 3 && vehicleDrives.length" class="divide-y divide-themed">
          <li v-for="drive in vehicleDrives" :key="drive.id" class="flex flex-wrap items-center gap-3 py-3">
            <span class="w-28 shrink-0 text-sm font-medium text-heading">
              {{ formatDate(`${drive.date}T12:00:00`, locale) }}
            </span>
            <span class="w-24 shrink-0 text-sm text-muted">{{ drive.from }}–{{ drive.to }}</span>
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <Avatar
                :src="sellerById(dealer.sellers, drive.sellerId)?.avatar"
                :name="sellerById(dealer.sellers, drive.sellerId)?.name"
                size="xs"
              />
              <span class="truncate text-sm text-body">
                {{ customerById(dealer.customers, drive.customerId)?.name ?? '—' }}
              </span>
            </div>
            <span
              v-if="!drive.cnhOk"
              class="rounded-full bg-error-50 px-2 py-0.5 text-[11px] font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500"
            >
              {{ t('drives.cnhMissing') }}
            </span>
            <DriveStatusPill :status="drive.status" />
          </li>
        </ul>
        <EmptyState v-else-if="tab === 3" icon="steering" :title="t('vehicleAdmin.noDrives')" />
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import { dlImage } from '@/data/mock'
import {
  commission,
  commissionRate,
  customerById,
  daysInStock,
  dealPrice,
  dealsOfVehicle,
  drivesOfVehicle,
  margin,
  marginPct,
  sellerById,
  suggestedDiscountPct,
  vehicleById,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconBase from '@/components/ui/IconBase.vue'
import Avatar from '@/components/ui/Avatar.vue'
import SpecGrid from '@/components/dl/SpecGrid.vue'
import StockPill from '@/components/dl/StockPill.vue'
import DealStagePill from '@/components/dl/DealStagePill.vue'
import DriveStatusPill from '@/components/dl/DriveStatusPill.vue'
import type { StockState } from '@/data/types'

const STATES: StockState[] = ['disponivel', 'reservado', 'vendido', 'preparacao']

const route = useRoute()
const { t, locale } = useI18n()
const now = useNow()
const tab = ref(0)

const dealer = useDealerStore()
const ui = useUiStore()

const vehicle = computed(() => vehicleById(dealer.vehicles, Number(route.params.id)))
const label = computed(() =>
  vehicle.value ? vehicleLabel(dealer.models, dealer.brands, vehicle.value) : t('vehicle.notFound')
)
usePageTitle(label)

const vehicleDeals = computed(() => (vehicle.value ? dealsOfVehicle(dealer.deals, vehicle.value.id) : []))
const vehicleDrives = computed(() => (vehicle.value ? drivesOfVehicle(dealer.drives, vehicle.value.id) : []))

const days = computed(() => (vehicle.value ? daysInStock(vehicle.value, now.value) : 0))
const totalCost = computed(() => (vehicle.value ? vehicle.value.acquisitionCost + vehicle.value.prepCost : 0))
const marginValue = computed(() => (vehicle.value ? margin(vehicle.value, vehicle.value.price) : 0))
const rate = computed(() => commissionRate(marginValue.value, dealer.rules))
const suggested = computed(() => suggestedDiscountPct(days.value, dealer.rules))

const tabs = computed(() => [
  { label: t('vehicleAdmin.tabs.spec'), icon: 'file-text' },
  { label: t('vehicleAdmin.tabs.costs'), icon: 'dollar' },
  { label: t('vehicleAdmin.tabs.deals'), icon: 'handshake' },
  { label: t('vehicleAdmin.tabs.drives'), icon: 'steering' },
])

function changeState(state: StockState) {
  if (!vehicle.value) return
  dealer.setVehicleState(vehicle.value.id, state)
  ui.notifySuccess(t('vehicleAdmin.saved'))
}
</script>
