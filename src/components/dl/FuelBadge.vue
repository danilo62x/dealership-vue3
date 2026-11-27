<template>
  <span :class="`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE[fuel]}`">
    <IconBase :name="ICON[fuel]" :size="size" :stroke-width="2.2" />
    {{ t(`spec.fuel.${fuel}`) }}
  </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconBase from '@/components/ui/IconBase.vue'
import type { Fuel } from '@/data/types'

const ICON: Record<Fuel, string> = {
  flex: 'fuel',
  gasolina: 'fuel',
  diesel: 'truck',
  hibrido: 'refresh-cw',
  eletrico: 'zap',
}

const TONE: Record<Fuel, string> = {
  flex: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  gasolina: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  diesel: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  hibrido: 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-500',
  eletrico: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
}

/** Combustível com ícone — o dado mais consultado depois do preço. */
withDefaults(defineProps<{ fuel: Fuel; size?: number }>(), { size: 12 })

const { t } = useI18n()
</script>
