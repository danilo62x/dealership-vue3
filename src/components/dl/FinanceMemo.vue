<template>
  <div :class="bare ? '' : 'surface-card rounded-2xl border p-5 md:p-6'">
    <div v-if="!bare" class="mb-4">
      <h3 class="flex items-center gap-2 font-semibold text-heading">
        <IconBase name="calculator" :size="18" class-name="text-brand-500" />
        {{ t('finance.memoTitle') }}
      </h3>
      <p class="mt-1 text-xs text-muted">{{ t('finance.memoSubtitle') }}</p>
    </div>

    <ol class="divide-y divide-themed overflow-hidden rounded-xl border border-themed">
      <li
        v-for="(step, i) in simulation.steps"
        :key="step.key"
        class="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
        >
          {{ i + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-heading">{{ t(`finance.memo.${step.key}`) }}</p>
          <p class="mt-0.5 font-mono text-xs break-words text-muted">{{ step.formula }}</p>
        </div>
        <span
          class="shrink-0 text-sm font-semibold sm:text-right"
          :class="
            step.key === 'cet' || step.key === 'installment' ? 'text-brand-600 dark:text-brand-400' : 'text-heading'
          "
        >
          {{ render(step.value, step.kind) }}
        </span>
      </li>
    </ol>

    <p class="mt-3 text-xs text-muted">{{ t('finance.cetHint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import type { Simulation } from '@/data/types'

/**
 * A memória do cálculo, linha a linha, na ordem em que a conta acontece.
 * Cada linha traz o rótulo, a fórmula já com os números substituídos e o
 * resultado — é isso que separa uma simulação de um número solto na tela.
 */
withDefaults(
  defineProps<{
    simulation: Simulation
    /** Sem o cabeçalho, para encaixar dentro de outro card. */
    bare?: boolean
  }>(),
  { bare: false }
)

const { t, locale } = useI18n()

function render(value: number, kind: 'money' | 'rate' | 'plain'): string {
  if (kind === 'money') return formatCurrency(value, locale.value)
  if (kind === 'rate') return `${(value * 100).toFixed(2).replace('.', ',')}%`
  return value.toLocaleString(locale.value, { maximumFractionDigits: 6 })
}
</script>
