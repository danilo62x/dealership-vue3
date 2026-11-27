<template>
  <div>
    <PageHeader
      :title="t('appraisals.title')"
      :subtitle="t('appraisals.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('appraisals.title') }]"
    />

    <FilterBar v-model:search="term" :search-placeholder="t('common.search')">
      <FilterSelect v-model:value="status" :label="t('common.status')">
        <option value="">{{ t('common.all') }}</option>
        <option value="accepted">{{ t('appraisal.accepted') }}</option>
        <option value="pending">{{ t('appraisal.pending') }}</option>
      </FilterSelect>
    </FilterBar>

    <div v-if="rows.length" class="surface-card overflow-hidden rounded-2xl border">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-themed text-xs text-muted">
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.customer') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.model') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.year') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.km') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.condition') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.value') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.deal') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('appraisals.columns.accepted') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tradeIn in rows.slice(0, 30)"
              :key="tradeIn.id"
              class="cursor-pointer border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
              @click="selected = tradeIn"
            >
              <td class="px-5 py-3 font-medium text-heading">
                {{ customerById(dealer.customers, tradeIn.customerId)?.name ?? '—' }}
                <span class="block text-xs font-normal text-muted">{{ formatDate(tradeIn.createdAt, locale) }}</span>
              </td>
              <td class="px-5 py-3 text-body">{{ modelLabel(dealer.models, dealer.brands, tradeIn.modelId) }}</td>
              <td class="px-5 py-3 text-body">{{ tradeIn.year }}</td>
              <td class="px-5 py-3 text-body">{{ formatNumber(tradeIn.km, locale) }}</td>
              <td class="px-5 py-3">
                <ConditionPill :condition="tradeIn.condition" />
              </td>
              <td class="px-5 py-3 font-semibold text-heading">{{ formatCurrency(valueOf(tradeIn), locale) }}</td>
              <td class="px-5 py-3 text-body">
                <RouterLink
                  v-if="tradeIn.dealId"
                  :to="`/app/proposta/${tradeIn.dealId}`"
                  class="text-brand-500 hover:text-brand-600"
                  @click.stop
                >
                  #{{ tradeIn.dealId }}
                </RouterLink>
                <span v-else class="text-muted">{{ t('appraisals.standalone') }}</span>
              </td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    tradeIn.accepted
                      ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                  "
                >
                  {{ tradeIn.accepted ? t('appraisal.accepted') : t('appraisal.pending') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="surface-card rounded-2xl border">
      <EmptyState icon="calculator" :title="t('appraisals.empty')" :description="t('appraisals.emptyDesc')" />
    </div>

    <Drawer
      :open="Boolean(selected)"
      :title="t('appraisals.detail')"
      :subtitle="selected ? modelLabel(dealer.models, dealer.brands, selected.modelId) : undefined"
      width="max-w-lg"
      @close="selected = null"
    >
      <div v-if="selected && detail" class="space-y-4">
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl border border-themed p-3">
            <dt class="text-xs text-muted">{{ t('appraisals.columns.customer') }}</dt>
            <dd class="mt-0.5 font-medium text-heading">
              {{ customerById(dealer.customers, selected.customerId)?.name ?? '—' }}
            </dd>
          </div>
          <div class="rounded-xl border border-themed p-3">
            <dt class="text-xs text-muted">{{ t('appraisals.columns.year') }}</dt>
            <dd class="mt-0.5 font-medium text-heading">{{ selected.year }}</dd>
          </div>
          <div class="rounded-xl border border-themed p-3">
            <dt class="text-xs text-muted">{{ t('appraisals.columns.km') }}</dt>
            <dd class="mt-0.5 font-medium text-heading">{{ formatNumber(selected.km, locale) }} km</dd>
          </div>
          <div class="rounded-xl border border-themed p-3">
            <dt class="text-xs text-muted">{{ t('appraisals.columns.condition') }}</dt>
            <dd class="mt-1">
              <ConditionPill :condition="selected.condition" />
            </dd>
          </div>
        </dl>

        <div v-if="selected.options.length > 0">
          <p class="mb-1.5 text-xs text-muted">{{ t('vehicle.options') }}</p>
          <ul class="flex flex-wrap gap-1.5">
            <li
              v-for="opt in selected.options"
              :key="opt"
              class="rounded-full border border-themed px-2.5 py-1 text-xs text-body"
            >
              {{ opt }}
            </li>
          </ul>
        </div>

        <AppraisalBreakdown :appraisal="detail" bare />
      </div>

      <template v-if="selected" #footer>
        <div class="flex gap-2">
          <button
            type="button"
            class="focus-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-success-500 text-sm font-medium text-white transition hover:bg-success-600"
            @click="decide(true)"
          >
            <IconBase name="check" :size="16" />
            {{ t('appraisals.accept') }}
          </button>
          <button
            type="button"
            class="focus-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body"
            @click="decide(false)"
          >
            <IconBase name="x" :size="16" />
            {{ t('appraisals.reject') }}
          </button>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import { appraiseTradeIn, customerById, modelLabel } from '@/data/query'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import Drawer from '@/components/ui/Drawer.vue'
import IconBase from '@/components/ui/IconBase.vue'
import AppraisalBreakdown from '@/components/dl/AppraisalBreakdown.vue'
import ConditionPill from '@/components/dl/ConditionPill.vue'
import type { TradeIn } from '@/data/types'

const { t, locale } = useI18n()
usePageTitle(() => t('appraisals.title'))
const now = useNow()

const dealer = useDealerStore()
const ui = useUiStore()

const term = ref('')
const status = ref('')
const selected = ref<TradeIn | null>(null)

const rows = computed(() => {
  const lower = term.value.trim().toLowerCase()
  return dealer.tradeIns
    .filter((tradeIn) => {
      if (status.value === 'accepted' && !tradeIn.accepted) return false
      if (status.value === 'pending' && tradeIn.accepted) return false
      if (!lower) return true
      const customer = customerById(dealer.customers, tradeIn.customerId)
      const model = modelLabel(dealer.models, dealer.brands, tradeIn.modelId)
      return `${customer?.name ?? ''} ${model}`.toLowerCase().includes(lower)
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

const detail = computed(() =>
  selected.value ? appraiseTradeIn(selected.value, dealer.models, dealer.rules, now.value) : null
)

const valueOf = (tradeIn: TradeIn) => appraiseTradeIn(tradeIn, dealer.models, dealer.rules, now.value).value

function decide(accepted: boolean) {
  if (!selected.value) return
  dealer.setTradeInAccepted(selected.value.id, accepted)
  ui.notifySuccess(t('appraisals.updated'))
  selected.value = null
}
</script>
