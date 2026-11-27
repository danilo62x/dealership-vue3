<template>
  <div v-if="!vehicle" class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="surface-card rounded-2xl border">
      <EmptyState icon="car" :title="t('vehicle.notFound')" :description="t('vehicle.notFoundDesc')">
        <template #action>
          <RouterLink
            to="/estoque"
            class="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            {{ t('nav.stock') }}
          </RouterLink>
        </template>
      </EmptyState>
    </div>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <Breadcrumb
      :items="[
        { label: t('nav.home'), href: '/', icon: 'home' },
        { label: t('nav.stock'), href: '/estoque' },
        { label },
      ]"
    />

    <div class="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div class="min-w-0">
        <VehicleGallery :seeds="vehicle.photoSeeds" :alt="label" />

        <div class="mt-6">
          <h2 class="text-lg font-semibold text-heading">{{ t('vehicle.specs') }}</h2>
          <div class="mt-3">
            <SpecGrid :vehicle="vehicle" />
          </div>
        </div>

        <div class="mt-6">
          <h2 class="text-lg font-semibold text-heading">{{ t('vehicle.options') }}</h2>
          <ul v-if="vehicle.options.length" class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="opt in vehicle.options"
              :key="opt"
              class="inline-flex items-center gap-1.5 rounded-full border border-themed px-3 py-1.5 text-xs font-medium text-body"
            >
              <IconBase name="check" :size="12" :stroke-width="2.5" class-name="text-success-500" />
              {{ opt }}
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-muted">{{ t('vehicle.noOptions') }}</p>
        </div>
      </div>

      <!-- ---- Coluna de compra ---- -->
      <aside class="min-w-0 space-y-5">
        <div class="surface-card rounded-2xl border p-5 md:p-6">
          <div class="flex flex-wrap items-center gap-2">
            <StockPill :state="vehicle.state" />
            <FuelBadge :fuel="vehicle.fuel" />
          </div>
          <h1 class="mt-3 text-2xl font-bold text-heading">{{ label }}</h1>
          <p class="mt-1 text-sm text-muted">
            {{ yearLabel(vehicle) }} · {{ formatNumber(vehicle.km, locale) }} km · {{ vehicle.color }}
          </p>

          <p class="mt-5 text-title-sm font-bold text-brand-600 dark:text-brand-400">
            {{ formatCurrency(vehicle.price, locale) }}
          </p>

          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2">
              <dt class="text-muted">{{ t('vehicle.arrived') }}</dt>
              <dd class="font-medium text-heading">{{ formatDate(vehicle.arrivedAt, locale) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2">
              <dt class="text-muted">{{ t('vehicle.daysInStock') }}</dt>
              <dd class="font-medium text-heading">{{ t('common.daysCount', { count: days }, days) }}</dd>
            </div>
          </dl>

          <p
            v-if="vehicle.state === 'preparacao'"
            class="mt-4 flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-500"
          >
            <IconBase name="alert-triangle" :size="14" class-name="mt-0.5" />
            {{ t('vehicle.inPrep') }}
          </p>

          <div class="mt-5 flex flex-col gap-2">
            <a
              href="/test-drive"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
              @click.prevent="goToDrive"
            >
              <IconBase name="steering" :size="16" />
              {{ t('vehicle.scheduleDrive') }}
            </a>
            <button
              type="button"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="ui.notifySuccess(t('vehicle.offerSent'))"
            >
              <IconBase name="handshake" :size="16" />
              {{ t('vehicle.makeOffer') }}
            </button>
          </div>
        </div>

        <!-- ---- Simulador embutido ---- -->
        <div>
          <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-heading">
            <IconBase name="calculator" :size="18" class-name="text-brand-500" />
            {{ t('vehicle.simulate') }}
          </h2>
          <FinanceSimulator :price="vehicle.price" show-memo />
        </div>
      </aside>
    </div>

    <!-- ---- Parecidos ---- -->
    <section v-if="similar.length > 0" class="mt-14">
      <h2 class="text-title-sm font-bold text-heading">{{ t('vehicle.similar') }}</h2>
      <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <VehicleCard v-for="v in similar" :key="v.id" :vehicle="v" compact />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import { daysInStock, similarVehicles, vehicleBySlug, vehicleLabel, yearLabel } from '@/data/query'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import VehicleGallery from '@/components/dl/VehicleGallery.vue'
import SpecGrid from '@/components/dl/SpecGrid.vue'
import FinanceSimulator from '@/components/dl/FinanceSimulator.vue'
import FuelBadge from '@/components/dl/FuelBadge.vue'
import StockPill from '@/components/dl/StockPill.vue'
import VehicleCard from '@/components/dl/VehicleCard.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const now = useNow()

const dealer = useDealerStore()
const ui = useUiStore()

const slug = computed(() => String(route.params.slug ?? ''))
const vehicle = computed(() => vehicleBySlug(dealer.vehicles, slug.value))
const label = computed(() =>
  vehicle.value ? vehicleLabel(dealer.models, dealer.brands, vehicle.value) : t('vehicle.notFound')
)

usePageTitle(label)

const similar = computed(() =>
  vehicle.value ? similarVehicles(dealer.vehicles, dealer.models, vehicle.value, 4) : []
)

const days = computed(() => (vehicle.value ? daysInStock(vehicle.value, now.value) : 0))

/** A página do test-drive recebe o carro escolhido pelo state da navegação. */
function goToDrive() {
  router.push({ path: '/test-drive', state: { vehicleId: vehicle.value?.id } })
}
</script>
