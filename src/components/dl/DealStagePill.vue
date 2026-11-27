<template>
  <Badge :color="DEAL_COLOR[stage]" dot>{{ t(`status.deal.${stage}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { DealStage } from '@/data/types'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'

const DEAL_COLOR: Record<DealStage, Color> = {
  contato: 'gray',
  proposta: 'brand',
  negociacao: 'warning',
  aprovada: 'success',
  perdida: 'error',
}

defineProps<{ stage: DealStage }>()

const { t } = useI18n()
</script>
