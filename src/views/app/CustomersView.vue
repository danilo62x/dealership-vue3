<template>
  <div>
    <PageHeader
      :title="t('customers.title')"
      :subtitle="t('customers.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('customers.title') }]"
    >
      <template #action>
        <button
          type="button"
          class="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="open = true"
        >
          <IconBase name="plus" :size="16" />
          {{ t('customers.new') }}
        </button>
      </template>
    </PageHeader>

    <FilterBar v-model:search="term" :search-placeholder="t('customers.searchPlaceholder')">
      <label class="flex items-center gap-2 text-sm text-muted">
        <input v-model="onlyExpired" type="checkbox" class="h-4 w-4 rounded border-themed accent-brand-500" />
        {{ t('customers.onlyExpired') }}
      </label>
    </FilterBar>

    <template v-if="pageItems.length">
      <div class="surface-card overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-themed text-xs text-muted">
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.name') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.contact') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.document') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.cnh') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.deals') }}</th>
                <th class="px-5 py-3 font-medium">{{ t('customers.columns.since') }}</th>
                <th class="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="customer in pageItems"
                :key="customer.id"
                class="cursor-pointer border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                @click="selected = customer"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <Avatar :src="customer.avatar" :name="customer.name" size="sm" />
                    <span class="font-medium text-heading">{{ customer.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-3 text-body">
                  <span class="block truncate text-xs">{{ customer.email }}</span>
                  <span class="block text-xs text-muted">{{ customer.phone }}</span>
                </td>
                <td class="px-5 py-3 text-xs text-muted">{{ customer.document }}</td>
                <td class="px-5 py-3">
                  <span v-if="!customer.cnhUntil" class="text-xs text-muted">{{ t('customers.cnhMissing') }}</span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="
                      cnhValid(customer, today)
                        ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                        : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
                    "
                  >
                    <IconBase :name="cnhValid(customer, today) ? 'check' : 'ban'" :size="11" />
                    {{
                      cnhValid(customer, today)
                        ? t('customers.cnhValid', { date: formatDate(customer.cnhUntil, locale) })
                        : t('customers.cnhExpired', { date: formatDate(customer.cnhUntil, locale) })
                    }}
                  </span>
                </td>
                <td class="px-5 py-3 text-body">{{ dealsOfCustomer(dealer.deals, customer.id).length }}</td>
                <td class="px-5 py-3 text-xs text-muted">{{ formatDate(customer.createdAt, locale) }}</td>
                <td class="px-5 py-3 text-right">
                  <button
                    type="button"
                    :title="t('common.remove')"
                    class="text-muted transition hover:text-error-600"
                    @click.stop="remove(customer.id)"
                  >
                    <IconBase name="trash" :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6">
        <Pagination :page="page" :total-pages="totalPages" @change="page = $event" />
      </div>
    </template>
    <div v-else class="surface-card rounded-2xl border">
      <EmptyState icon="users" :title="t('customers.empty')" :description="t('customers.emptyDesc')" />
    </div>

    <!-- ---- Histórico ---- -->
    <Drawer
      :open="Boolean(selected)"
      :title="t('customers.historyTitle')"
      :subtitle="selected?.name"
      width="max-w-lg"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-5">
        <div class="flex items-center gap-3">
          <Avatar :src="selected.avatar" :name="selected.name" size="lg" />
          <div class="min-w-0">
            <p class="truncate font-semibold text-heading">{{ selected.name }}</p>
            <p class="truncate text-xs text-muted">{{ selected.email }}</p>
            <p class="mt-1">
              <span v-if="!selected.cnhUntil" class="text-xs text-muted">{{ t('customers.cnhMissing') }}</span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                :class="
                  cnhValid(selected, today)
                    ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
                    : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
                "
              >
                <IconBase :name="cnhValid(selected, today) ? 'check' : 'ban'" :size="11" />
                {{
                  cnhValid(selected, today)
                    ? t('customers.cnhValid', { date: formatDate(selected.cnhUntil, locale) })
                    : t('customers.cnhExpired', { date: formatDate(selected.cnhUntil, locale) })
                }}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h4 class="mb-2 text-sm font-semibold text-heading">{{ t('customers.bought') }}</h4>
          <ul v-if="bought.length" class="divide-y divide-themed">
            <li v-for="deal in bought" :key="deal.id" class="flex items-center justify-between gap-3 py-2.5">
              <RouterLink
                :to="`/app/proposta/${deal.id}`"
                class="min-w-0 flex-1 truncate text-sm text-heading hover:text-brand-600"
              >
                {{ vehicleNameOf(deal.vehicleId) }}
              </RouterLink>
              <span class="shrink-0 text-sm font-semibold text-heading">
                {{ formatCurrency(dealPrice(deal, vehicleById(dealer.vehicles, deal.vehicleId)), locale) }}
              </span>
            </li>
          </ul>
          <p v-else class="text-sm text-muted">{{ t('customers.noHistory') }}</p>
        </div>

        <div>
          <h4 class="mb-2 text-sm font-semibold text-heading">{{ t('deals.title') }}</h4>
          <ul v-if="history.length" class="divide-y divide-themed">
            <li v-for="deal in history.slice(0, 10)" :key="deal.id" class="flex items-center gap-3 py-2.5">
              <DealStagePill :stage="deal.stage" />
              <RouterLink
                :to="`/app/proposta/${deal.id}`"
                class="min-w-0 flex-1 truncate text-sm text-body hover:text-brand-600"
              >
                {{ vehicleNameOf(deal.vehicleId) }}
              </RouterLink>
              <span class="shrink-0 text-xs text-muted">{{ formatDate(deal.movedAt, locale) }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-muted">{{ t('customers.noHistory') }}</p>
        </div>

        <div v-if="trades.length > 0">
          <h4 class="mb-2 text-sm font-semibold text-heading">{{ t('appraisals.title') }}</h4>
          <ul class="divide-y divide-themed">
            <li
              v-for="trade in trades.slice(0, 6)"
              :key="trade.id"
              class="flex items-center justify-between gap-3 py-2.5"
            >
              <span class="min-w-0 flex-1 truncate text-sm text-body">
                {{ modelLabel(dealer.models, dealer.brands, trade.modelId) }} · {{ trade.year }}
              </span>
              <span class="shrink-0 text-xs text-muted">{{ formatDate(trade.createdAt, locale) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Drawer>

    <!-- ---- Novo cliente ---- -->
    <ModalBase :open="open" :title="t('customers.new')" @close="open = false">
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="c-name">
            {{ t('customers.columns.name') }}
          </label>
          <input id="c-name" v-model="form.name" :class="control" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="c-email">{{ t('auth.email') }}</label>
            <input id="c-email" v-model="form.email" type="email" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="c-phone">
              {{ t('drive.yourPhone') }}
            </label>
            <input id="c-phone" v-model="form.phone" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="c-doc">
              {{ t('customers.columns.document') }}
            </label>
            <input id="c-doc" v-model="form.document" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="c-cnh">{{ t('drive.cnh') }}</label>
            <input id="c-cnh" v-model="form.cnhUntil" type="date" :class="control" />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body"
          @click="open = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="submit"
        >
          {{ t('common.save') }}
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { useNow } from '@/composables/useNow'
import {
  cnhValid,
  dealPrice,
  dealsOfCustomer,
  modelLabel,
  tradeInsOfCustomer,
  vehicleById,
  vehicleLabel,
} from '@/data/query'
import { formatCurrency, formatDate } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import Drawer from '@/components/ui/Drawer.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Avatar from '@/components/ui/Avatar.vue'
import IconBase from '@/components/ui/IconBase.vue'
import DealStagePill from '@/components/dl/DealStagePill.vue'
import type { Customer } from '@/data/types'

const PAGE_SIZE = 12

const { t, locale } = useI18n()
usePageTitle(() => t('customers.title'))
const now = useNow()
const today = computed(() => new Date(now.value).toISOString().slice(0, 10))

const dealer = useDealerStore()
const ui = useUiStore()

const term = ref('')
const onlyExpired = ref(false)
const page = ref(1)
const selected = ref<Customer | null>(null)
const open = ref(false)
const form = reactive({ name: '', email: '', phone: '', document: '', cnhUntil: '' })

const rows = computed(() => {
  const lower = term.value.trim().toLowerCase()
  return dealer.customers.filter((c) => {
    if (onlyExpired.value && cnhValid(c, today.value)) return false
    if (!lower) return true
    return `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(lower)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / PAGE_SIZE)))
const pageItems = computed(() => rows.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

const history = computed(() => (selected.value ? dealsOfCustomer(dealer.deals, selected.value.id) : []))
const bought = computed(() => history.value.filter((d) => d.stage === 'aprovada'))
const trades = computed(() => (selected.value ? tradeInsOfCustomer(dealer.tradeIns, selected.value.id) : []))

function vehicleNameOf(id: number): string {
  const vehicle = vehicleById(dealer.vehicles, id)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
}

function remove(id: number) {
  dealer.removeCustomer(id)
  ui.notifySuccess(t('customers.removed'))
}

function submit() {
  dealer.saveCustomer({
    name: form.name,
    email: form.email,
    phone: form.phone,
    document: form.document,
    cnhUntil: form.cnhUntil ? new Date(`${form.cnhUntil}T12:00:00`).toISOString() : null,
  })
  open.value = false
  form.name = ''
  form.email = ''
  form.phone = ''
  form.document = ''
  form.cnhUntil = ''
  ui.notifySuccess(t('customers.saved'))
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
