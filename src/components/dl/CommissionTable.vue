<template>
  <div class="surface-card rounded-2xl border p-5 md:p-6">
    <h3 class="flex items-center gap-2 font-semibold text-heading">
      <IconBase name="percent" :size="18" class-name="text-brand-500" />
      {{ t('sellers.tiersTitle') }}
    </h3>
    <p class="mt-1 text-xs text-muted">{{ t('sellers.tiersSubtitle') }}</p>

    <div class="mt-4 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-themed text-xs text-muted">
            <th class="py-2 pr-4 font-medium">{{ t('sellers.tierFrom') }}</th>
            <th class="py-2 pr-4 font-medium">{{ t('sellers.tierPct') }}</th>
            <th class="py-2 font-medium">{{ t('common.details') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.min" class="border-b border-themed last:border-0">
            <td class="py-2.5 pr-4 font-medium text-heading">{{ formatCurrency(row.min, locale) }}</td>
            <td class="py-2.5 pr-4 text-body">{{ formatPercent(row.pct, locale) }}</td>
            <td class="py-2.5 text-xs text-muted">
              {{
                t('sellers.tierExample', {
                  margin: formatCurrency(row.example, locale),
                  value: formatCurrency(row.commission, locale),
                })
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { commission } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'

/** Exemplo de margem usado em cada faixa, para a conta não ficar abstrata. */
const EXAMPLE_OFFSET = 2500

/**
 * As faixas de comissão, com o exemplo de quanto o vendedor leva em cada uma.
 * A comissão é uma fatia da margem, então uma venda com margem maior sobe de
 * faixa e paga proporcionalmente mais.
 */
const { t, locale } = useI18n()
const dealer = useDealerStore()

const rows = computed(() =>
  dealer.rules.commissionTiers.map(([min, pct]) => {
    const example = min + EXAMPLE_OFFSET
    return { min, pct, example, commission: commission(example, dealer.rules) }
  })
)
</script>
