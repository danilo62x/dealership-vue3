<template>
  <div class="space-y-5">
    <div class="surface-card rounded-2xl border p-5 md:p-6">
      <div class="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div class="space-y-4">
          <div>
            <label class="mb-1.5 flex items-center justify-between text-sm font-medium text-heading" for="sim-down">
              {{ t('finance.down') }}
              <span class="text-xs font-normal text-muted">
                {{ t('finance.minDown', { value: formatCurrency(floor, locale) }) }}
              </span>
            </label>
            <input
              id="sim-down"
              type="number"
              :min="floor"
              :max="price"
              :step="500"
              :value="down"
              :class="control"
              @input="down = Number(($event.target as HTMLInputElement).value)"
            />
            <input
              type="range"
              :min="floor"
              :max="price"
              :step="500"
              :value="effectiveDown"
              class="mt-2 w-full"
              :aria-label="t('finance.down')"
              @input="down = Number(($event.target as HTMLInputElement).value)"
            />
            <p v-if="belowFloor" class="mt-1.5 flex items-start gap-1.5 text-xs text-warning-600 dark:text-warning-500">
              <IconBase name="alert-triangle" :size="14" class-name="mt-0.5" />
              {{ t('finance.minDownHint', { pct: formatPercent(1 - dealer.rules.minDownPct, locale) }) }}
            </p>
            <p v-if="tradeIn > 0" class="mt-1.5 flex items-start gap-1.5 text-xs text-success-600 dark:text-success-500">
              <IconBase name="check-circle" :size="14" class-name="mt-0.5" />
              {{ t('finance.tradeInApplied', { value: formatCurrency(tradeIn, locale) }) }}
            </p>
          </div>

          <div>
            <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('finance.months') }}</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="n in TERMS"
                :key="n"
                type="button"
                class="focus-ring rounded-lg border px-4 py-2 text-sm font-medium transition"
                :class="
                  months === n
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-themed text-body hover:text-heading'
                "
                @click="months = n"
              >
                {{ t('finance.monthsUnit', { months: n }) }}
              </button>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="sim-rate">{{ t('finance.rate') }}</label>
            <div class="flex items-center gap-3">
              <input
                id="sim-rate"
                type="range"
                :min="0.005"
                :max="0.035"
                :step="0.0005"
                :value="rate"
                class="w-full"
                @input="rate = Number(($event.target as HTMLInputElement).value)"
              />
              <span class="w-20 shrink-0 text-right text-sm font-semibold text-heading">
                {{ (rate * 100).toFixed(2).replace('.', ',') }}%
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
          <p class="text-xs tracking-wider text-muted uppercase">{{ t('finance.installment') }}</p>
          <p class="mt-1 text-title-sm font-bold text-brand-600 dark:text-brand-400">
            {{ formatCurrency(simulation.installment, locale)
            }}<span class="text-base font-medium text-muted">{{ t('common.perMonth') }}</span>
          </p>

          <dl class="mt-5 space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('finance.financed') }}</dt>
              <dd class="font-medium text-heading">{{ formatCurrency(simulation.financed, locale) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('finance.total') }}</dt>
              <dd class="font-medium text-heading">{{ formatCurrency(simulation.total, locale) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('finance.interest') }}</dt>
              <dd class="font-medium text-heading">{{ formatCurrency(simulation.interest, locale) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
              <dt class="text-muted">{{ t('finance.cet') }}</dt>
              <dd class="font-bold text-heading">{{ (simulation.cet * 100).toFixed(2).replace('.', ',') }}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div v-if="showCompare" class="surface-card rounded-2xl border p-5 md:p-6">
      <h3 class="font-semibold text-heading">{{ t('finance.compare.title') }}</h3>
      <p class="mt-1 text-xs text-muted">{{ t('finance.compare.subtitle') }}</p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="row in comparison"
          :key="row.months"
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="
            months === row.months ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed hover:border-brand-300'
          "
          @click="months = row.months"
        >
          <p class="text-xs font-medium text-muted">{{ t('finance.monthsUnit', { months: row.months }) }}</p>
          <p class="mt-1 text-lg font-bold text-heading">{{ formatCurrency(row.sim.installment, locale) }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ t('finance.total') }}: {{ formatCurrency(row.sim.total, locale) }}
          </p>
          <p class="text-xs text-muted">
            {{ t('finance.cet') }}: {{ (row.sim.cet * 100).toFixed(2).replace('.', ',') }}%
          </p>
          <span
            v-if="row.months === cheapest.months"
            class="mt-2 inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-500/15 dark:text-success-500"
          >
            <IconBase name="check" :size="11" :stroke-width="2.5" />
            {{ t('finance.compare.cheapest') }}
          </span>
        </button>
      </div>
    </div>

    <FinanceMemo v-if="showMemo" :simulation="simulation" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { minDown, simulate } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import FinanceMemo from './FinanceMemo.vue'
import type { Simulation } from '@/data/types'

const TERMS = [24, 36, 48, 60]

/**
 * Simulador ao vivo. Mexer na entrada, no prazo ou na taxa recalcula na hora,
 * e a entrada nunca desce da mínima do estoque — a tela diz por quê.
 */
const props = withDefaults(
  defineProps<{
    price: number
    /** Valor da troca já aprovada — abate a entrada do carro novo. */
    tradeIn?: number
    /** Mostra a memória do cálculo embaixo dos números. */
    showMemo?: boolean
    /** Mostra a comparação dos quatro prazos lado a lado. */
    showCompare?: boolean
  }>(),
  { tradeIn: 0, showMemo: true, showCompare: false }
)

const emit = defineEmits<{ change: [simulation: Simulation] }>()

const { t, locale } = useI18n()
const dealer = useDealerStore()

const floor = computed(() => minDown(props.price, dealer.rules))
const down = ref(floor.value)
const months = ref(48)
const rate = ref(dealer.rules.defaultMonthlyRate)

// O preço muda quando o visitante troca de veículo: a entrada volta ao piso.
watch(
  () => [props.price, dealer.rules] as const,
  () => {
    down.value = minDown(props.price, dealer.rules)
  }
)

const effectiveDown = computed(() => Math.max(floor.value, Math.min(down.value, props.price)))
const belowFloor = computed(() => down.value < floor.value)

const simulation = computed(() =>
  simulate(
    { price: props.price, down: effectiveDown.value, months: months.value, rate: rate.value, tradeIn: props.tradeIn },
    dealer.rules
  )
)

watch(simulation, (sim) => emit('change', sim), { immediate: true })

const comparison = computed(() =>
  TERMS.map((n) => ({
    months: n,
    sim: simulate(
      { price: props.price, down: effectiveDown.value, months: n, rate: rate.value, tradeIn: props.tradeIn },
      dealer.rules
    ),
  }))
)

const cheapest = computed(() =>
  comparison.value.reduce((best, row) => (row.sim.total < best.sim.total ? row : best), comparison.value[0])
)

const control =
  'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm font-medium text-body'
</script>
