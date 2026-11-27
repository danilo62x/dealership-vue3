<template>
  <Badge :color="STOCK_COLOR[state]" dot>{{ t(`status.stock.${state}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { StockState } from '@/data/types'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'

const STOCK_COLOR: Record<StockState, Color> = {
  disponivel: 'success',
  reservado: 'warning',
  vendido: 'gray',
  preparacao: 'brand',
}

/** Situação do veículo no estoque — é ela que decide a vitrine. */
defineProps<{ state: StockState }>()

const { t } = useI18n()
</script>
