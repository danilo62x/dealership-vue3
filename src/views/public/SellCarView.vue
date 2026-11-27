<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-6">
      <h1 class="text-title-sm font-bold text-heading">{{ t('appraisal.title') }}</h1>
      <p class="mt-1 max-w-2xl text-sm text-muted">{{ t('appraisal.subtitle') }}</p>
    </header>

    <TradeInForm submittable @submit="submit" />

    <div
      v-if="saved"
      class="mt-5 flex items-start gap-3 rounded-2xl border border-success-200 bg-success-50 p-5 dark:border-success-500/30 dark:bg-success-500/10"
    >
      <IconBase name="check-circle" :size="20" class-name="mt-0.5 text-success-600" />
      <div>
        <p class="text-sm font-semibold text-heading">
          {{ t('appraisal.result') }}: {{ formatCurrency(saved.value, locale) }}
        </p>
        <p class="mt-1 text-sm text-muted">{{ t('appraisal.applyToDeal') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { VISITOR_CUSTOMER_ID } from '@/data/mock'
import { formatCurrency } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import TradeInForm, { type TradeInInput } from '@/components/dl/TradeInForm.vue'
import type { Appraisal } from '@/data/types'

const { t, locale } = useI18n()
usePageTitle(() => t('appraisal.title'))

const dealer = useDealerStore()
const ui = useUiStore()
const saved = ref<Appraisal | null>(null)

function submit(appraisal: Appraisal, input: TradeInInput) {
  dealer.saveTradeIn({
    customerId: VISITOR_CUSTOMER_ID,
    modelId: input.modelId,
    year: input.year,
    km: input.km,
    condition: input.condition,
    options: input.options,
    accepted: false,
  })
  saved.value = appraisal
  ui.notifySuccess(t('appraisal.saved'))
}
</script>
