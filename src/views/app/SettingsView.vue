<template>
  <div>
    <PageHeader
      :title="t('settings.title')"
      :subtitle="t('settings.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('settings.title') }]"
    >
      <template #action>
        <button
          type="button"
          class="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="ui.notifySuccess(t('settings.saved'))"
        >
          <IconBase name="check" :size="16" />
          {{ t('common.save') }}
        </button>
      </template>
    </PageHeader>

    <div class="surface-card rounded-2xl border p-5 md:p-6">
      <Tabs v-model="tab" :tabs="tabs">
        <!-- ---- Perfil ---- -->
        <div v-if="tab === 0" class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="p-name">
              {{ t('settings.profile.name') }}
            </label>
            <input
              id="p-name"
              :value="auth.user?.name ?? ''"
              :class="control"
              @input="auth.updateProfile({ name: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="p-email">
              {{ t('settings.profile.email') }}
            </label>
            <input
              id="p-email"
              type="email"
              :value="auth.user?.email ?? ''"
              :class="control"
              @input="auth.updateProfile({ email: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="p-role">
              {{ t('settings.profile.role') }}
            </label>
            <input
              id="p-role"
              :value="auth.user?.role ?? ''"
              :class="control"
              @input="auth.updateProfile({ role: ($event.target as HTMLInputElement).value })"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="p-store">
              {{ t('settings.profile.store') }}
            </label>
            <input
              id="p-store"
              :value="auth.user?.store ?? ''"
              :class="control"
              @input="auth.updateProfile({ store: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </div>

        <!-- ---- Loja ---- -->
        <div v-else-if="tab === 1" class="grid gap-4 sm:grid-cols-2">
          <div v-for="field in STORE_FIELDS" :key="field.key" :class="field.key === 'address' ? 'sm:col-span-2' : ''">
            <label class="mb-1.5 block text-sm font-medium text-heading" :for="`s-${field.key}`">
              {{ t(field.label) }}
            </label>
            <input :id="`s-${field.key}`" v-model="store[field.key]" :class="control" />
          </div>
        </div>

        <!-- ---- Regras ---- -->
        <div v-else-if="tab === 2" class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-rate">
                {{ t('settings.rules.defaultMonthlyRate') }}
              </label>
              <input
                id="r-rate"
                type="number"
                :step="0.01"
                :value="(dealer.rules.defaultMonthlyRate * 100).toFixed(2)"
                :class="control"
                @input="
                  dealer.saveRules({ defaultMonthlyRate: Number(($event.target as HTMLInputElement).value) / 100 })
                "
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-down">
                {{ t('settings.rules.minDownPct') }}
              </label>
              <input
                id="r-down"
                type="number"
                :step="1"
                :value="Math.round(dealer.rules.minDownPct * 100)"
                :class="control"
                @input="dealer.saveRules({ minDownPct: Number(($event.target as HTMLInputElement).value) / 100 })"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-fee">
                {{ t('settings.rules.registrationFee') }}
              </label>
              <input
                id="r-fee"
                type="number"
                :value="dealer.rules.registrationFee"
                :class="control"
                @input="dealer.saveRules({ registrationFee: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-iof">
                {{ t('settings.rules.iocPct') }}
              </label>
              <input
                id="r-iof"
                type="number"
                :step="0.01"
                :value="(dealer.rules.iocPct * 100).toFixed(2)"
                :class="control"
                @input="dealer.saveRules({ iocPct: Number(($event.target as HTMLInputElement).value) / 100 })"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-slow">
                {{ t('settings.rules.slowStockDays') }}
              </label>
              <input
                id="r-slow"
                type="number"
                :value="dealer.rules.slowStockDays"
                :class="control"
                @input="dealer.saveRules({ slowStockDays: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-dep">
                {{ t('settings.rules.depreciationPerYear') }}
              </label>
              <input
                id="r-dep"
                type="number"
                :step="0.5"
                :value="(dealer.rules.depreciationPerYear * 100).toFixed(1)"
                :class="control"
                @input="
                  dealer.saveRules({ depreciationPerYear: Number(($event.target as HTMLInputElement).value) / 100 })
                "
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-km">
                {{ t('settings.rules.kmPerYearRef') }}
              </label>
              <input
                id="r-km"
                type="number"
                :step="500"
                :value="dealer.rules.kmPerYearRef"
                :class="control"
                @input="dealer.saveRules({ kmPerYearRef: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="r-kmadj">
                {{ t('settings.rules.kmAdjustPer1000') }}
              </label>
              <input
                id="r-kmadj"
                type="number"
                :step="10"
                :value="dealer.rules.kmAdjustPer1000"
                :class="control"
                @input="dealer.saveRules({ kmAdjustPer1000: Number(($event.target as HTMLInputElement).value) })"
              />
            </div>
          </div>

          <div class="rounded-xl border border-themed p-4 text-sm text-muted">
            {{ t('finance.minDown', { value: formatCurrency(100000 * dealer.rules.minDownPct, locale) }) }} ·
            {{ t('finance.rate') }} {{ formatPercent(dealer.rules.defaultMonthlyRate, locale) }} ·
            {{ t('settings.rules.slowStockDays') }} {{ dealer.rules.slowStockDays }}
          </div>

          <CommissionTable />
        </div>

        <!-- ---- Preferências ---- -->
        <div v-else class="space-y-5">
          <div class="flex items-center justify-between gap-4 rounded-xl border border-themed p-4">
            <div>
              <p class="text-sm font-medium text-heading">{{ t('settings.preferences.darkMode') }}</p>
            </div>
            <SwitchToggle :model-value="ui.darkMode" @update:model-value="ui.setDarkMode($event)" />
          </div>

          <div class="rounded-xl border border-themed p-4">
            <p class="mb-2 text-sm font-medium text-heading">{{ t('settings.preferences.language') }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="language in LANGUAGES"
                :key="language.code"
                type="button"
                class="focus-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition"
                :class="
                  locale === language.code
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'border-themed text-body'
                "
                @click="setLanguage(language.code)"
              >
                <span aria-hidden>{{ language.flag }}</span>
                {{ language.label }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-themed p-4">
            <p class="text-sm font-medium text-heading">{{ t('settings.preferences.cookies') }}</p>
            <button
              type="button"
              class="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
              @click="ui.openCookieBanner()"
            >
              {{ t('common.open') }}
            </button>
          </div>

          <div
            class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-error-200 p-4 dark:border-error-500/30"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-heading">{{ t('settings.preferences.reset') }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ t('settings.preferences.resetHint') }}</p>
            </div>
            <button
              type="button"
              class="focus-ring inline-flex items-center gap-2 rounded-lg border border-error-200 px-4 py-2 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
              @click="resetData"
            >
              <IconBase name="refresh-cw" :size="16" />
              {{ t('settings.preferences.reset') }}
            </button>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useDealerStore } from '@/stores/dealer'
import { STORE } from '@/data/mock'
import { LANGUAGES, setLanguage } from '@/i18n'
import { formatCurrency, formatPercent } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import IconBase from '@/components/ui/IconBase.vue'
import CommissionTable from '@/components/dl/CommissionTable.vue'

type StoreKey = 'legalName' | 'address' | 'phone' | 'whatsapp' | 'email' | 'hours'

const STORE_FIELDS: { key: StoreKey; label: string }[] = [
  { key: 'legalName', label: 'settings.store.legalName' },
  { key: 'address', label: 'settings.store.address' },
  { key: 'phone', label: 'settings.store.phone' },
  { key: 'whatsapp', label: 'settings.store.whatsapp' },
  { key: 'email', label: 'settings.store.email' },
  { key: 'hours', label: 'settings.store.hours' },
]

const { t, locale } = useI18n()
usePageTitle(() => t('settings.title'))
const tab = ref(0)

const auth = useAuthStore()
const ui = useUiStore()
const dealer = useDealerStore()

const store = reactive<Record<StoreKey, string>>({
  legalName: STORE.legalName,
  address: STORE.address,
  phone: STORE.phone,
  whatsapp: STORE.whatsapp,
  email: STORE.email,
  hours: STORE.hours,
})

const tabs = computed(() => [
  { label: t('settings.tabs.profile'), icon: 'user' },
  { label: t('settings.tabs.store'), icon: 'store' },
  { label: t('settings.tabs.rules'), icon: 'calculator' },
  { label: t('settings.tabs.preferences'), icon: 'settings' },
])

function resetData() {
  dealer.reset()
  dealer.$persist?.()
  ui.notifySuccess(t('settings.preferences.resetDone'))
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
