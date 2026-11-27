<template>
  <div class="grid gap-5 lg:grid-cols-[1fr_1fr]">
    <div class="surface-card rounded-2xl border p-5 md:p-6">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="ti-model">{{ t('appraisal.model') }}</label>
          <select
            id="ti-model"
            :value="modelId"
            :class="control"
            @change="modelId = Number(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="model in dealer.models" :key="model.id" :value="model.id">
              {{ brandById(dealer.brands, model.brandId)?.name }} {{ model.name }}
            </option>
          </select>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="ti-year">{{ t('appraisal.year') }}</label>
            <select
              id="ti-year"
              :value="year"
              :class="control"
              @change="year = Number(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="ti-km">{{ t('appraisal.km') }}</label>
            <input
              id="ti-km"
              type="number"
              :min="0"
              :step="1000"
              :value="km"
              :class="control"
              @input="km = Math.max(0, Number(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('appraisal.condition') }}</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in CONDITIONS"
              :key="c"
              type="button"
              class="focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition"
              :class="
                condition === c ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body hover:text-heading'
              "
              @click="condition = c"
            >
              {{ t(`status.condition.${c}`) }}
            </button>
          </div>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('appraisal.options') }}</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in OPTION_CATALOG"
              :key="opt"
              type="button"
              class="focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
              :class="
                options.includes(opt)
                  ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'border-themed text-muted hover:text-body'
              "
              @click="toggleOption(opt)"
            >
              <IconBase v-if="options.includes(opt)" name="check" :size="12" :stroke-width="2.5" />
              {{ opt }}
            </button>
          </div>
        </div>

        <button
          v-if="submittable"
          type="button"
          class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="emit('submit', appraisal, input)"
        >
          <IconBase name="calculator" :size="16" />
          {{ submitLabel ?? t('appraisal.cta') }}
        </button>
      </div>
    </div>

    <AppraisalBreakdown :appraisal="appraisal" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/composables/useNow'
import { OPTION_CATALOG } from '@/data/mock'
import { appraise, brandById } from '@/data/query'
import IconBase from '@/components/ui/IconBase.vue'
import AppraisalBreakdown from './AppraisalBreakdown.vue'
import type { Appraisal, Condition } from '@/data/types'

const CONDITIONS: Condition[] = ['excelente', 'bom', 'regular', 'ruim']

export interface TradeInInput {
  modelId: number
  year: number
  km: number
  condition: Condition
  options: string[]
}

/**
 * Formulário de troca. A faixa sai na hora e os ajustes aparecem abertos —
 * nada de "entraremos em contato com uma proposta".
 */
withDefaults(
  defineProps<{
    /** Liga o botão de gravar a avaliação; sem ele o formulário só estima. */
    submittable?: boolean
    submitLabel?: string
  }>(),
  { submittable: false }
)

const emit = defineEmits<{ submit: [appraisal: Appraisal, input: TradeInInput] }>()

const { t } = useI18n()
const now = useNow()
const dealer = useDealerStore()

const currentYear = new Date(now.value).getFullYear()

const modelId = ref(dealer.models[0]?.id ?? 1)
const year = ref(currentYear - 5)
const km = ref(60000)
const condition = ref<Condition>('bom')
const options = ref<string[]>(['Ar-condicionado', 'Central multimídia'])

const input = computed<TradeInInput>(() => ({
  modelId: modelId.value,
  year: year.value,
  km: km.value,
  condition: condition.value,
  options: options.value,
}))

const appraisal = computed(() => appraise(input.value, dealer.models, dealer.rules, now.value))

const years = computed(() => {
  const list: number[] = []
  const base = new Date(now.value).getFullYear()
  for (let y = base; y >= base - 20; y--) list.push(y)
  return list
})

function toggleOption(opt: string) {
  options.value = options.value.includes(opt)
    ? options.value.filter((o) => o !== opt)
    : [...options.value, opt]
}

const control ='focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
