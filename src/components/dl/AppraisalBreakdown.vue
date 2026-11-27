<template>
  <div :class="bare ? '' : 'surface-card rounded-2xl border p-5 md:p-6'">
    <h3 v-if="!bare" class="mb-4 flex items-center gap-2 font-semibold text-heading">
      <IconBase name="calculator" :size="18" class-name="text-brand-500" />
      {{ t('appraisal.breakdown') }}
    </h3>

    <ul class="divide-y divide-themed overflow-hidden rounded-xl border border-themed">
      <li class="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 dark:bg-white/5">
        <span class="text-sm font-medium text-heading">{{ t('appraisal.reference') }}</span>
        <span class="text-sm font-semibold text-heading">{{ formatCurrency(appraisal.reference, locale) }}</span>
      </li>
      <li v-for="adj in appraisal.adjustments" :key="adj.key" class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-0 text-sm text-body">{{ label(adj) }}</span>
        <span
          class="shrink-0 text-sm font-semibold"
          :class="
            adj.amount < 0
              ? 'text-error-600 dark:text-error-500'
              : adj.amount > 0
                ? 'text-success-600 dark:text-success-500'
                : 'text-muted'
          "
        >
          {{ adj.amount > 0 ? '+' : '' }}{{ formatCurrency(adj.amount, locale) }}
        </span>
      </li>
      <li class="flex items-center justify-between gap-4 bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
        <span class="text-sm font-semibold text-heading">{{ t('appraisal.result') }}</span>
        <span class="text-base font-bold text-brand-600 dark:text-brand-400">
          {{ formatCurrency(appraisal.value, locale) }}
        </span>
      </li>
    </ul>

    <p class="mt-3 flex items-center gap-1.5 text-xs text-muted">
      <IconBase name="info" :size="14" />
      {{
        t('appraisal.range', {
          low: formatCurrency(appraisal.low, locale),
          high: formatCurrency(appraisal.high, locale),
        })
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import type { Adjustment, Appraisal } from '@/data/types'

/**
 * Cada ajuste da avaliação em UMA linha, com o valor em reais — positivo ou
 * negativo. Sem essa abertura o cliente só veria o número final e teria de
 * acreditar nele.
 */
withDefaults(
  defineProps<{
    appraisal: Appraisal
    /** Sem o cartão em volta, para encaixar dentro de outro bloco. */
    bare?: boolean
  }>(),
  { bare: false }
)

const { t, locale } = useI18n()

function label(adj: Adjustment): string {
  if (adj.key.startsWith('condition.')) {
    const condition = adj.key.slice('condition.'.length)
    return t('appraisal.adj.conditionLabel', { detail: t(`status.condition.${condition}`) })
  }
  return t(`appraisal.adj.${adj.key}`, { detail: adj.detail })
}
</script>
