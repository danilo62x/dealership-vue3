<template>
  <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-6">
      <h1 class="text-title-sm font-bold text-heading">{{ t('drive.title') }}</h1>
      <p class="mt-1 text-sm text-muted">{{ t('drive.subtitle') }}</p>
    </header>

    <DriveScheduler :initial-vehicle-id="initialVehicleId" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import DriveScheduler from '@/components/dl/DriveScheduler.vue'

const { t } = useI18n()
usePageTitle(() => t('drive.title'))

// A página do veículo manda o carro escolhido pelo state da navegação.
const initialVehicleId = (window.history.state as { vehicleId?: number } | null)?.vehicleId
</script>
