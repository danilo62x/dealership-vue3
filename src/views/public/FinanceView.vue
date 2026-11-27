<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-6">
      <h1 class="text-title-sm font-bold text-heading">{{ t('finance.title') }}</h1>
      <p class="mt-1 max-w-2xl text-sm text-muted">{{ t('finance.subtitle') }}</p>
    </header>

    <div class="surface-card mb-5 rounded-2xl border p-5 md:p-6">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="fin-vehicle">
            {{ t('finance.pickVehicle') }}
          </label>
          <select
            id="fin-vehicle"
            :value="vehicleId"
            :class="control"
            @change="vehicleId = Number(($event.target as HTMLSelectElement).value)"
          >
            <option :value="FREE_VALUE">{{ t('finance.freeValue') }}</option>
            <option v-for="v in showcase" :key="v.id" :value="v.id">
              {{ vehicleLabel(dealer.models, dealer.brands, v) }} · {{ v.modelYear }} ·
              {{ formatCurrency(v.price, locale) }}
            </option>
          </select>
          <p v-if="selected" class="mt-1.5 text-xs text-muted">
            {{ t('finance.ofVehicle', { name: vehicleLabel(dealer.models, dealer.brands, selected) }) }}
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="fin-price">{{ t('finance.price') }}</label>
          <input
            id="fin-price"
            type="number"
            :min="10000"
            :step="1000"
            :value="price"
            :disabled="Boolean(selected)"
            :class="`${control} disabled:opacity-60`"
            @input="freePrice = Math.max(10000, Number(($event.target as HTMLInputElement).value))"
          />
          <p class="mt-1.5 text-xs text-muted">
            {{ t('finance.minDown', { value: formatCurrency(minDown(price, dealer.rules), locale) }) }} ·
            {{ t('finance.rate') }} {{ formatPercent(dealer.rules.defaultMonthlyRate, locale) }}
          </p>
        </div>
      </div>
    </div>

    <FinanceSimulator :price="price" show-memo show-compare />

    <section class="surface-card mt-5 rounded-2xl border p-5 md:p-6">
      <h2 class="flex items-center gap-2 font-semibold text-heading">
        <IconBase name="info" :size="18" class-name="text-brand-500" />
        {{ t('finance.cet') }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm text-muted">{{ t('finance.cetHint') }}</p>
      <dl class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-themed p-3.5">
          <dt class="text-xs text-muted">{{ t('finance.fee') }}</dt>
          <dd class="mt-1 text-sm font-semibold text-heading">
            {{ formatCurrency(dealer.rules.registrationFee, locale) }}
          </dd>
        </div>
        <div class="rounded-xl border border-themed p-3.5">
          <dt class="text-xs text-muted">{{ t('finance.iof') }}</dt>
          <dd class="mt-1 text-sm font-semibold text-heading">{{ formatPercent(dealer.rules.iocPct, locale) }}</dd>
        </div>
        <div class="rounded-xl border border-themed p-3.5">
          <dt class="text-xs text-muted">{{ t('settings.rules.minDownPct') }}</dt>
          <dd class="mt-1 text-sm font-semibold text-heading">{{ formatPercent(dealer.rules.minDownPct, locale) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { availableStock, minDown, vehicleLabel } from '@/data/query'
import { formatCurrency, formatPercent } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import FinanceSimulator from '@/components/dl/FinanceSimulator.vue'

const FREE_VALUE = -1

const { t, locale } = useI18n()
usePageTitle(() => t('finance.title'))

const dealer = useDealerStore()

const showcase = computed(() => availableStock(dealer.vehicles).slice(0, 40))
const vehicleId = ref<number>(showcase.value[0]?.id ?? FREE_VALUE)
const freePrice = ref(90000)

const selected = computed(() => showcase.value.find((v) => v.id === vehicleId.value))
const price = computed(() => (selected.value ? selected.value.price : freePrice.value))

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
