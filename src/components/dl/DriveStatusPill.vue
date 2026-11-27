<template>
  <Badge :color="DRIVE_COLOR[status]" dot>{{ t(`status.drive.${status}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { DriveStatus } from '@/data/types'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'

const DRIVE_COLOR: Record<DriveStatus, Color> = {
  agendado: 'brand',
  realizado: 'success',
  cancelado: 'gray',
  faltou: 'error',
}

defineProps<{ status: DriveStatus }>()

const { t } = useI18n()
</script>
