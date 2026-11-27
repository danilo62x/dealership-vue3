<template>
  <Badge :color="CONDITION_COLOR[condition]">{{ t(`status.condition.${condition}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { Condition } from '@/data/types'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'

const CONDITION_COLOR: Record<Condition, Color> = {
  excelente: 'success',
  bom: 'brand',
  regular: 'warning',
  ruim: 'error',
}

defineProps<{ condition: Condition }>()

const { t } = useI18n()
</script>
