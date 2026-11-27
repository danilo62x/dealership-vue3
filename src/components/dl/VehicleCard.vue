<template>
  <article class="surface-card group flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-theme-md">
    <RouterLink :to="`/veiculo/${vehicle.slug}`" class="relative block overflow-hidden">
      <img
        :src="dlImage(vehicle.photoSeeds[0] ?? vehicle.slug, 640, 420)"
        :alt="label"
        loading="lazy"
        class="w-full object-cover transition duration-500 group-hover:scale-105"
        :class="compact ? 'aspect-[16/10]' : 'aspect-[3/2]'"
      />
      <span v-if="showState" class="absolute top-3 left-3">
        <StockPill :state="vehicle.state" />
      </span>
      <span class="absolute top-3 right-3">
        <FuelBadge :fuel="vehicle.fuel" />
      </span>
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <h3 class="line-clamp-1 font-semibold text-heading">
        <RouterLink
          :to="`/veiculo/${vehicle.slug}`"
          class="transition group-hover:text-brand-600 dark:group-hover:text-brand-400"
        >
          {{ label }}
        </RouterLink>
      </h3>
      <p class="mt-0.5 line-clamp-1 text-xs text-muted">
        {{ yearLabel(vehicle) }} · {{ formatNumber(vehicle.km, lang) }} km · {{ vehicle.color }}
      </p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span class="inline-flex items-center gap-1">
          <IconBase name="settings" :size="13" />
          {{ t(`spec.transmission.${vehicle.transmission}`) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <IconBase name="gauge" :size="13" />
          {{ formatNumber(vehicle.km, lang) }} km
        </span>
      </div>

      <div class="mt-auto pt-4">
        <p class="text-lg font-bold text-heading">{{ formatCurrency(vehicle.price, lang) }}</p>
        <p class="text-xs text-muted">
          {{ t('vehicle.fromInstallment', { value: `${formatCurrency(installment, lang)}${t('common.perMonth')}` }) }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { dlImage } from '@/data/mock'
import { minDown, pmt, vehicleLabel, yearLabel } from '@/data/query'
import { formatCurrency, formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import FuelBadge from './FuelBadge.vue'
import StockPill from './StockPill.vue'
import type { Vehicle } from '@/data/types'

/**
 * Card da vitrine. A parcela "a partir de" NÃO é um campo gravado: sai do
 * mesmo `pmt()` do simulador, com a entrada mínima da loja e o prazo máximo.
 */
const props = withDefaults(
  defineProps<{
    vehicle: Vehicle
    /** Mostra a situação do estoque — só faz sentido na área logada. */
    showState?: boolean
    compact?: boolean
  }>(),
  { showState: false, compact: false }
)

const { t, locale } = useI18n()
const dealer = useDealerStore()

const lang = computed(() => locale.value)
const label = computed(() => vehicleLabel(dealer.models, dealer.brands, props.vehicle))
const installment = computed(() =>
  pmt(props.vehicle.price - minDown(props.vehicle.price, dealer.rules), dealer.rules.defaultMonthlyRate, 48)
)
</script>
