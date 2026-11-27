<template>
  <div>
    <PageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.subtitle')" />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        :title="t('dashboard.kpi.sales')"
        :value="t('common.salesCount', { count: kpis.sales }, kpis.sales)"
        icon="handshake"
        accent="brand"
      />
      <KpiCard
        :title="t('dashboard.kpi.ticket')"
        :value="formatCurrency(kpis.avgTicket, locale)"
        icon="dollar"
        accent="success"
      />
      <KpiCard
        :title="t('dashboard.kpi.margin')"
        :value="formatCurrency(kpis.totalMargin, locale)"
        :hint="kpis.revenue ? formatPercent(kpis.totalMargin / kpis.revenue, locale) : undefined"
        icon="trending-up"
        accent="info"
      />
      <KpiCard
        :title="t('dashboard.kpi.turnover')"
        :value="t('common.daysCount', { count: kpis.avgDays }, kpis.avgDays)"
        :hint="t('dashboard.kpi.turnoverHint')"
        icon="clock"
        accent="warning"
      />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <!-- ---- Vendas por dia ---- -->
      <div class="surface-card rounded-2xl border p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 class="font-semibold text-heading">{{ t('dashboard.chartTitle') }}</h2>
            <p class="mt-1 text-xs text-muted">{{ t('dashboard.chartSubtitle') }}</p>
          </div>
          <p class="text-sm font-semibold text-heading">{{ formatCurrency(kpis.revenue, locale) }}</p>
        </div>
        <div class="mt-4">
          <ApexChart type="area" :height="280" :series="chartSeries" :options="chartOptions" />
        </div>
      </div>

      <!-- ---- Funil ---- -->
      <div class="surface-card rounded-2xl border p-5 md:p-6">
        <h2 class="font-semibold text-heading">{{ t('dashboard.funnelTitle') }}</h2>
        <p class="mt-1 text-xs text-muted">{{ t('dashboard.funnelSubtitle') }}</p>

        <ul class="mt-4 space-y-3">
          <li v-for="(row, i) in rows" :key="row.stage">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="font-medium text-heading">{{ t(`status.deal.${row.stage}`) }}</span>
              <span class="text-muted">
                {{ t('common.dealsCount', { count: row.count }, row.count) }} ·
                {{ formatCurrencyCompact(row.value, locale) }}
              </span>
            </div>
            <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${Math.round((row.count / maxFunnel) * 100)}%`,
                  backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length],
                }"
              />
            </div>
          </li>
        </ul>

        <RouterLink
          to="/app/propostas"
          class="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          {{ t('appNav.deals') }}
          <IconBase name="arrow-right" :size="15" />
        </RouterLink>
      </div>
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-2">
      <!-- ---- Giro lento ---- -->
      <div class="surface-card rounded-2xl border p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 class="font-semibold text-heading">{{ t('dashboard.slowTitle') }}</h2>
            <p class="mt-1 text-xs text-muted">
              {{ t('dashboard.slowSubtitle', { days: dealer.rules.slowStockDays }) }}
            </p>
          </div>
          <span
            class="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-700 dark:bg-warning-500/15 dark:text-warning-500"
          >
            {{ slow.length }}
          </span>
        </div>

        <ul v-if="slow.length" class="mt-4 divide-y divide-themed">
          <li v-for="row in slow.slice(0, 6)" :key="row.vehicle.id" class="flex items-center gap-3 py-3">
            <div class="min-w-0 flex-1">
              <RouterLink
                :to="`/app/veiculo/${row.vehicle.id}`"
                class="block truncate text-sm font-medium text-heading hover:text-brand-600"
              >
                {{ vehicleLabel(dealer.models, dealer.brands, row.vehicle) }}
              </RouterLink>
              <p class="text-xs text-muted">
                {{ t('common.daysCount', { count: row.days }, row.days) }} ·
                {{ formatCurrency(row.vehicle.price, locale) }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-semibold text-warning-600 dark:text-warning-500">
                −{{ formatPercent(row.suggestedDiscountPct, locale) }}
              </p>
              <p class="text-xs text-muted">
                {{ t('dashboard.suggested') }}: {{ formatCurrency(row.suggestedPrice, locale) }}
              </p>
            </div>
          </li>
        </ul>
        <p v-else class="mt-6 text-sm text-muted">{{ t('dashboard.slowEmpty') }}</p>
      </div>

      <!-- ---- Agenda de hoje ---- -->
      <div class="surface-card rounded-2xl border p-5 md:p-6">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <h2 class="font-semibold text-heading">{{ t('dashboard.agendaTitle') }}</h2>
          <RouterLink to="/app/test-drives" class="text-sm font-medium text-brand-500 hover:text-brand-600">
            {{ t('common.viewAll') }}
          </RouterLink>
        </div>

        <ul v-if="agenda.length" class="mt-4 divide-y divide-themed">
          <li v-for="drive in agenda.slice(0, 6)" :key="drive.id" class="flex items-center gap-3 py-3">
            <span class="w-14 shrink-0 text-sm font-semibold text-heading">{{ drive.from }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-heading">{{ vehicleNameOf(drive.vehicleId) }}</p>
              <p class="truncate text-xs text-muted">
                {{ customerById(dealer.customers, drive.customerId)?.name ?? '—' }} ·
                {{ sellerById(dealer.sellers, drive.sellerId)?.name ?? '—' }}
              </p>
            </div>
            <DriveStatusPill :status="drive.status" />
          </li>
        </ul>
        <EmptyState v-else icon="calendar" :title="t('dashboard.agendaEmpty')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/composables/useNow'
import { TODAY_KEY } from '@/data/mock'
import {
  customerById,
  drivesOfDay,
  funnel,
  salesByDay,
  sellerById,
  slowMovers,
  stockKpis,
  vehicleById,
  vehicleLabel,
} from '@/data/query'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import ApexChart from '@/components/ui/ApexChart.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconBase from '@/components/ui/IconBase.vue'
import KpiCard from '@/components/dl/KpiCard.vue'
import DriveStatusPill from '@/components/dl/DriveStatusPill.vue'

const STAGE_COLORS = ['#98a2b3', '#0aa295', '#f79009', '#12b76a', '#f04438']

const { t, locale } = useI18n()
usePageTitle(() => t('dashboard.title'))
const now = useNow()
const dealer = useDealerStore()

const kpis = computed(() => stockKpis(dealer.vehicles, now.value, dealer.rules))
const rows = computed(() => funnel(dealer.deals, dealer.vehicles, 90, now.value))
const series = computed(() => salesByDay(dealer.vehicles, 30, now.value))
const slow = computed(() => slowMovers(dealer.vehicles, now.value, dealer.rules))
const agenda = computed(() => drivesOfDay(dealer.drives, TODAY_KEY))

const maxFunnel = computed(() => Math.max(1, ...rows.value.map((r) => r.count)))

const chartSeries = computed(() => [
  { name: t('dashboard.chartSeries'), data: series.value.map((p) => p.value) },
])

const chartOptions = computed(() => ({
  xaxis: { categories: series.value.map((p) => p.label), tickAmount: 8 },
  yaxis: { labels: { formatter: (v: number) => formatCurrencyCompact(v, locale.value) } },
  fill: { type: 'gradient', gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0.02 } },
}))

function vehicleNameOf(id: number): string {
  const vehicle = vehicleById(dealer.vehicles, id)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
}
</script>
