<template>
  <dl class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div v-for="row in rows" :key="row.label" class="rounded-xl border border-themed p-3.5">
      <dt class="flex items-center gap-1.5 text-xs text-muted">
        <IconBase :name="row.icon" :size="14" />
        {{ row.label }}
      </dt>
      <dd class="mt-1 text-sm font-semibold text-heading">{{ row.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { modelById, yearLabel } from '@/data/query'
import { formatNumber } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import type { Vehicle } from '@/data/types'

/** Ficha técnica em grade — cada linha vem do veículo, nada é escrito à mão. */
const props = defineProps<{ vehicle: Vehicle }>()

const { t, locale } = useI18n()
const dealer = useDealerStore()

const rows = computed(() => {
  const lang = locale.value
  const v = props.vehicle
  const model = modelById(dealer.models, v.modelId)
  return [
    { icon: 'calendar', label: t('vehicle.year'), value: yearLabel(v) },
    { icon: 'gauge', label: t('vehicle.km'), value: `${formatNumber(v.km, lang)} km` },
    { icon: 'settings', label: t('vehicle.transmission'), value: t(`spec.transmission.${v.transmission}`) },
    { icon: 'fuel', label: t('vehicle.fuel'), value: t(`spec.fuel.${v.fuel}`) },
    { icon: 'palette', label: t('vehicle.color'), value: v.color },
    { icon: 'grid', label: t('vehicle.doors'), value: String(v.doors) },
    { icon: 'car', label: t('vehicle.category'), value: model ? t(`spec.category.${model.category}`) : '—' },
    { icon: 'barcode', label: t('vehicle.plateEnd'), value: v.plateEnd },
  ]
})
</script>
