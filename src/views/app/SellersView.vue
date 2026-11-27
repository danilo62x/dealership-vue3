<template>
  <div>
    <PageHeader
      :title="t('sellers.title')"
      :subtitle="t('sellers.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('sellers.title') }]"
    />

    <div class="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <div class="surface-card overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-themed text-xs text-muted">
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.seller') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.sales') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.goal') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.revenue') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.margin') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('sellers.columns.commission') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.seller.id" class="border-b border-themed last:border-0">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <Avatar :src="row.seller.avatar" :name="row.seller.name" size="sm" />
                    <div class="min-w-0">
                      <span class="block truncate font-medium text-heading">{{ row.seller.name }}</span>
                      <span class="block truncate text-xs text-muted">
                        {{ t('sellers.since', { date: formatDate(row.seller.since, locale) }) }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 font-semibold text-heading">{{ row.sales }}</td>
                <td class="px-5 py-3">
                  <span class="text-xs text-muted">
                    {{ t('sellers.goalProgress', { done: row.sales, goal: row.goal }) }}
                  </span>
                  <span class="mt-1 block h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <span
                      class="block h-full rounded-full"
                      :class="row.goalPct >= 1 ? 'bg-success-500' : 'bg-brand-500'"
                      :style="{ width: `${Math.min(100, Math.round(row.goalPct * 100))}%` }"
                    />
                  </span>
                </td>
                <td class="px-5 py-3 text-body">{{ formatCurrency(row.revenue, locale) }}</td>
                <td class="px-5 py-3">
                  <span
                    :class="
                      row.margin < 0
                        ? 'font-medium text-error-600 dark:text-error-500'
                        : 'font-medium text-success-600 dark:text-success-500'
                    "
                  >
                    {{ formatCurrency(row.margin, locale) }}
                  </span>
                </td>
                <td class="px-5 py-3 font-semibold text-brand-600 dark:text-brand-400">
                  <!-- sem espaço entre o valor e o percentual: o React encosta os dois nós de texto -->
                  {{ formatCurrency(row.commission, locale)
                  }}<span v-if="row.margin > 0" class="ml-1 text-xs font-normal text-muted">{{
                    formatPercent(row.commission / row.margin, locale)
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-5">
        <div class="surface-card rounded-2xl border p-5 md:p-6">
          <h2 class="font-semibold text-heading">{{ t('sellers.columns.commission') }}</h2>
          <div class="mt-3">
            <ApexChart type="bar" :height="260" :series="chartSeries" :options="chartOptions" />
          </div>
        </div>

        <CommissionTable />
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
import { sellerPerformance } from '@/data/query'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import ApexChart from '@/components/ui/ApexChart.vue'
import Avatar from '@/components/ui/Avatar.vue'
import CommissionTable from '@/components/dl/CommissionTable.vue'

const { t, locale } = useI18n()
usePageTitle(() => t('sellers.title'))
const now = useNow()

const dealer = useDealerStore()

const rows = computed(() =>
  sellerPerformance(dealer.sellers, dealer.deals, dealer.vehicles, now.value, dealer.rules)
)

const chartSeries = computed(() => [
  { name: t('sellers.columns.commission'), data: rows.value.map((r) => r.commission) },
])

const chartOptions = computed(() => ({
  xaxis: { categories: rows.value.map((r) => r.seller.name.split(' ')[0]) },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
}))
</script>
