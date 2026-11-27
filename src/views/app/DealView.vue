<template>
  <div v-if="!deal || !vehicle" class="surface-card rounded-2xl border">
    <EmptyState icon="handshake" :title="t('deal.notFound')">
      <template #action>
        <RouterLink
          to="/app/propostas"
          class="focus-ring rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white"
        >
          {{ t('deal.backToBoard') }}
        </RouterLink>
      </template>
    </EmptyState>
  </div>

  <div v-else>
    <PageHeader
      :title="`${t('deal.title')} #${deal.id}`"
      :subtitle="`${customer?.name ?? '—'} · ${formatDate(deal.createdAt, locale)}`"
      :crumbs="[
        { label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' },
        { label: t('deals.title'), href: '/app/propostas' },
        { label: `#${deal.id}` },
      ]"
    >
      <template #action>
        <RouterLink
          to="/app/propostas"
          class="focus-ring flex h-11 items-center gap-2 rounded-lg border border-themed px-5 text-sm font-medium text-body"
        >
          <IconBase name="arrow-right" :size="16" class-name="rotate-180" />
          {{ t('deal.backToBoard') }}
        </RouterLink>
      </template>
    </PageHeader>

    <div class="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div class="min-w-0 space-y-5">
        <!-- ---- Veículo ---- -->
        <section class="surface-card rounded-2xl border p-5 md:p-6">
          <h2 class="mb-4 font-semibold text-heading">{{ t('deal.vehicleSection') }}</h2>
          <div class="flex flex-col gap-4 sm:flex-row">
            <img
              :src="dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 320, 220)"
              :alt="label"
              class="h-32 w-full shrink-0 rounded-xl object-cover sm:w-48"
            />
            <div class="min-w-0 flex-1">
              <RouterLink :to="`/app/veiculo/${vehicle.id}`" class="font-semibold text-heading hover:text-brand-600">
                {{ label }}
              </RouterLink>
              <p class="mt-0.5 text-sm text-muted">
                {{ yearLabel(vehicle) }} · {{ formatNumber(vehicle.km, locale) }} km · {{ vehicle.color }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <DealStagePill :stage="deal.stage" />
                <span class="text-sm font-bold text-heading">{{ formatCurrency(vehicle.price, locale) }}</span>
              </div>
              <p
                v-if="deal.stage === 'perdida' && deal.lostReason"
                class="mt-3 flex items-center gap-2 text-xs text-error-600 dark:text-error-500"
              >
                <IconBase name="ban" :size="14" />
                {{ t('deals.lostReason') }}: {{ deal.lostReason }}
              </p>
            </div>
          </div>
        </section>

        <!-- ---- Financiamento ---- -->
        <section class="surface-card rounded-2xl border p-5 md:p-6">
          <h2 class="mb-4 font-semibold text-heading">{{ t('deal.financeSection') }}</h2>
          <template v-if="simulation">
            <dl class="mb-4 grid gap-3 sm:grid-cols-4">
              <div class="rounded-xl border border-themed p-3.5">
                <dt class="text-xs text-muted">{{ t('finance.down') }}</dt>
                <dd class="mt-1 text-sm font-semibold text-heading">{{ formatCurrency(simulation.down, locale) }}</dd>
              </div>
              <div class="rounded-xl border border-themed p-3.5">
                <dt class="text-xs text-muted">{{ t('finance.months') }}</dt>
                <dd class="mt-1 text-sm font-semibold text-heading">
                  {{ t('finance.monthsUnit', { months: simulation.months }) }}
                </dd>
              </div>
              <div class="rounded-xl border border-themed p-3.5">
                <dt class="text-xs text-muted">{{ t('finance.installment') }}</dt>
                <dd class="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {{ formatCurrency(simulation.installment, locale) }}
                </dd>
              </div>
              <div class="rounded-xl border border-themed p-3.5">
                <dt class="text-xs text-muted">{{ t('finance.cet') }}</dt>
                <dd class="mt-1 text-sm font-semibold text-heading">
                  {{ (simulation.cet * 100).toFixed(2).replace('.', ',') }}%
                </dd>
              </div>
            </dl>
            <FinanceMemo :simulation="simulation" bare />
          </template>
          <p v-else class="text-sm text-muted">{{ t('deal.noFinance') }}</p>
        </section>

        <!-- ---- Troca ---- -->
        <section class="surface-card rounded-2xl border p-5 md:p-6">
          <h2 class="mb-4 font-semibold text-heading">{{ t('deal.tradeSection') }}</h2>
          <template v-if="tradeIn && appraisal">
            <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <span class="font-medium text-heading">
                {{ modelLabel(dealer.models, dealer.brands, tradeIn.modelId) }}
              </span>
              <span class="text-muted">{{ tradeIn.year }} · {{ formatNumber(tradeIn.km, locale) }} km</span>
              <ConditionPill :condition="tradeIn.condition" />
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
            </div>

            <AppraisalBreakdown :appraisal="appraisal" bare />

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                class="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
                @click="toggleTrade"
              >
                {{ tradeIn.accepted ? t('deal.rejectTrade') : t('deal.acceptTrade') }}
              </button>
            </div>
            <p class="mt-3 text-xs text-muted">{{ t('appraisal.applyToDeal') }}</p>
          </template>
          <p v-else class="text-sm text-muted">{{ t('deal.noTrade') }}</p>
        </section>
      </div>

      <!-- ---- Desconto e aprovação ---- -->
      <aside class="min-w-0 space-y-5">
        <section class="surface-card rounded-2xl border p-5 md:p-6">
          <h2 class="mb-4 font-semibold text-heading">{{ t('deal.approvalSection') }}</h2>

          <div class="mb-4 flex items-center gap-3">
            <Avatar :src="seller?.avatar" :name="seller?.name" size="sm" />
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-heading">{{ seller?.name ?? '—' }}</p>
              <p class="truncate text-xs text-muted">{{ customer?.name ?? '—' }}</p>
            </div>
          </div>

          <label class="mb-1.5 block text-sm font-medium text-heading" for="d-discount">{{ t('deal.discount') }}</label>
          <input
            id="d-discount"
            type="number"
            :min="0"
            :max="vehicle.price"
            :step="100"
            :value="discount"
            :class="control"
            @input="discount = Math.max(0, Number(($event.target as HTMLInputElement).value))"
          />

          <dl class="mt-4 space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('deal.finalPrice') }}</dt>
              <dd class="font-semibold text-heading">{{ formatCurrency(finalPrice, locale) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('deal.marginAfter') }}</dt>
              <dd
                class="font-semibold"
                :class="marginValue < 0 ? 'text-error-600 dark:text-error-500' : 'text-success-600 dark:text-success-500'"
              >
                {{ formatCurrency(marginValue, locale)
                }}<span class="ml-1 text-xs font-normal text-muted">{{
                  formatPercent(marginPct(vehicle, finalPrice), locale)
                }}</span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('deal.commission') }}</dt>
              <dd class="font-semibold text-heading">
                {{ formatCurrency(commission(marginValue, dealer.rules), locale)
                }}<span class="ml-1 text-xs font-normal text-muted">{{
                  formatPercent(commissionRate(marginValue, dealer.rules), locale)
                }}</span>
              </dd>
            </div>
          </dl>

          <div class="mt-5 flex flex-col gap-2">
            <button
              type="button"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-themed text-sm font-medium text-body"
              @click="applyDiscount"
            >
              <IconBase name="edit" :size="16" />
              {{ t('common.save') }}
            </button>
            <button
              type="button"
              :disabled="deal.stage === 'aprovada'"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-success-500 text-sm font-medium text-white transition hover:bg-success-600 disabled:opacity-50"
              @click="approve"
            >
              <IconBase name="check-circle" :size="16" />
              {{ t('deal.approve') }}
            </button>
            <button
              type="button"
              :disabled="deal.stage !== 'aprovada'"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
              @click="close"
            >
              <IconBase name="dollar" :size="16" />
              {{ t('deal.closeSale') }}
            </button>
            <button
              type="button"
              :disabled="deal.stage === 'perdida'"
              class="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-error-200 text-sm font-medium text-error-600 transition hover:bg-error-50 disabled:opacity-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
              @click="lose"
            >
              <IconBase name="ban" :size="16" />
              {{ t('deal.lose') }}
            </button>
          </div>

          <p class="mt-4 text-xs text-muted">{{ t('deals.approvedNote') }}</p>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import { dlImage } from '@/data/mock'
import {
  appraiseTradeIn,
  commission,
  commissionRate,
  customerById,
  dealById,
  margin,
  marginPct,
  modelLabel,
  sellerById,
  simulate,
  tradeInById,
  vehicleById,
  vehicleLabel,
  yearLabel,
} from '@/data/query'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconBase from '@/components/ui/IconBase.vue'
import Avatar from '@/components/ui/Avatar.vue'
import FinanceMemo from '@/components/dl/FinanceMemo.vue'
import AppraisalBreakdown from '@/components/dl/AppraisalBreakdown.vue'
import ConditionPill from '@/components/dl/ConditionPill.vue'
import DealStagePill from '@/components/dl/DealStagePill.vue'

const route = useRoute()
const { t, locale } = useI18n()
const now = useNow()

const dealer = useDealerStore()
const ui = useUiStore()

const dealId = computed(() => Number(route.params.id))
const deal = computed(() => dealById(dealer.deals, dealId.value))
const vehicle = computed(() => (deal.value ? vehicleById(dealer.vehicles, deal.value.vehicleId) : undefined))
const label = computed(() =>
  vehicle.value ? vehicleLabel(dealer.models, dealer.brands, vehicle.value) : t('deal.notFound')
)
usePageTitle(() => `${t('deal.title')} #${route.params.id}`)

const customer = computed(() => (deal.value ? customerById(dealer.customers, deal.value.customerId) : undefined))
const seller = computed(() => (deal.value ? sellerById(dealer.sellers, deal.value.sellerId) : undefined))

const tradeIn = computed(() =>
  deal.value?.tradeInId ? tradeInById(dealer.tradeIns, deal.value.tradeInId) : undefined
)
const appraisal = computed(() =>
  tradeIn.value ? appraiseTradeIn(tradeIn.value, dealer.models, dealer.rules, now.value) : null
)
const tradeValue = computed(() => (tradeIn.value?.accepted && appraisal.value ? appraisal.value.value : 0))

const discount = ref(deal.value?.discount ?? 0)

watch(
  () => deal.value?.id,
  () => {
    discount.value = deal.value?.discount ?? 0
  }
)

const simulation = computed(() => {
  if (!deal.value?.finance || !vehicle.value) return null
  return simulate(
    {
      price: Math.max(0, vehicle.value.price - discount.value),
      down: deal.value.finance.down,
      months: deal.value.finance.months,
      rate: deal.value.finance.monthlyRate,
      tradeIn: tradeValue.value,
    },
    dealer.rules
  )
})

const finalPrice = computed(() => Math.max(0, (vehicle.value?.price ?? 0) - discount.value))
const marginValue = computed(() => (vehicle.value ? margin(vehicle.value, finalPrice.value) : 0))

function applyDiscount() {
  if (!deal.value) return
  dealer.saveDeal({ id: deal.value.id, discount: discount.value })
  ui.notify(t('vehicleAdmin.saved'), 'success')
}

function approve() {
  if (!deal.value) return
  dealer.moveDeal(deal.value.id, 'aprovada')
  ui.notify(t('deals.reserved', { name: label.value }), 'warning')
}

function close() {
  if (!deal.value) return
  dealer.closeSale(deal.value.id)
  ui.notify(t('deal.closed'), 'success')
}

function lose() {
  if (!deal.value) return
  dealer.moveDeal(deal.value.id, 'perdida', 'Desistiu da compra')
  ui.notify(t('deals.released', { name: label.value }), 'info')
}

function toggleTrade() {
  if (!tradeIn.value) return
  dealer.setTradeInAccepted(tradeIn.value.id, !tradeIn.value.accepted)
  ui.notify(t('appraisals.updated'), 'success')
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
