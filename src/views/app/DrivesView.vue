<template>
  <div>
    <PageHeader
      :title="t('drives.title')"
      :subtitle="t('drives.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('drives.title') }]"
    >
      <template v-if="conflicts.size > 0" #action>
        <span
          class="inline-flex items-center gap-2 rounded-lg bg-error-50 px-4 py-2.5 text-sm font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500"
        >
          <IconBase name="alert-triangle" :size="16" />
          {{ t('drives.conflictsCount', { count: conflicts.size }, conflicts.size) }}
        </span>
      </template>
    </PageHeader>

    <!-- ---- Régua de dias ---- -->
    <div class="surface-card no-scrollbar mb-5 flex gap-2 overflow-x-auto rounded-2xl border p-3">
      <button
        v-for="o in days"
        :key="o"
        type="button"
        class="shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition"
        :class="offset === o ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body hover:border-brand-300'"
        @click="offset = o"
      >
        <span class="block text-[11px] opacity-80">
          {{ o === 0 ? t('common.today') : o === 1 ? t('common.tomorrow') : '' }}
        </span>
        <span class="block text-sm font-semibold">{{ formatDate(`${dayKey(o)}T12:00:00`, locale) }}</span>
        <span class="block text-[11px] opacity-80">{{ dayCount(o) }}</span>
      </button>
    </div>

    <div v-if="rows.length" class="surface-card overflow-hidden rounded-2xl border">
      <ul class="divide-y divide-themed">
        <li v-for="drive in rows" :key="drive.id" class="p-4" :class="conflicts.get(drive.id) ? 'bg-error-50/60 dark:bg-error-500/5' : ''">
          <div class="flex flex-wrap items-center gap-3">
            <span class="w-24 shrink-0 text-sm font-semibold text-heading">{{ drive.from }}–{{ drive.to }}</span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-heading">
                <RouterLink
                  v-if="vehicleOf(drive.vehicleId)"
                  :to="`/app/veiculo/${drive.vehicleId}`"
                  class="hover:text-brand-600"
                >
                  {{ vehicleNameOf(drive.vehicleId) }}
                </RouterLink>
                <template v-else>—</template>
              </p>
              <p class="truncate text-xs text-muted">
                {{ customerById(dealer.customers, drive.customerId)?.name ?? '—' }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <Avatar
                :src="sellerById(dealer.sellers, drive.sellerId)?.avatar"
                :name="sellerById(dealer.sellers, drive.sellerId)?.name"
                size="xs"
              />
              <span class="hidden text-xs text-muted sm:block">
                {{ sellerById(dealer.sellers, drive.sellerId)?.name ?? '—' }}
              </span>
            </div>

            <span
              v-if="!drive.cnhOk"
              class="inline-flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-[11px] font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500"
            >
              <IconBase name="ban" :size="11" />
              {{ t('drives.cnhMissing') }}
            </span>

            <DriveStatusPill :status="drive.status" />

            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                :title="t('drives.markDone')"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-success-600"
                @click="update(drive.id, 'realizado')"
              >
                <IconBase name="check" :size="15" />
              </button>
              <button
                type="button"
                :title="t('drives.markNoShow')"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-warning-600"
                @click="update(drive.id, 'faltou')"
              >
                <IconBase name="user" :size="15" />
              </button>
              <button
                type="button"
                :title="t('drives.cancelDrive')"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-themed text-muted hover:text-error-600"
                @click="update(drive.id, 'cancelado')"
              >
                <IconBase name="x" :size="15" />
              </button>
            </div>
          </div>

          <!-- Os dois conflitos aparecem separados: veículo e vendedor. -->
          <div v-if="conflicts.get(drive.id)" class="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-24">
            <span
              v-if="conflicts.get(drive.id)?.vehicle"
              class="inline-flex items-center gap-1.5 rounded-lg bg-error-50 px-2.5 py-1 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500"
            >
              <IconBase name="car" :size="12" />
              {{ t('drives.conflictVehicle') }} · {{ conflicts.get(drive.id)!.vehicle!.from }}–{{
                conflicts.get(drive.id)!.vehicle!.to
              }}
            </span>
            <span
              v-if="conflicts.get(drive.id)?.seller"
              class="inline-flex items-center gap-1.5 rounded-lg bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-700 dark:bg-warning-500/15 dark:text-warning-500"
            >
              <IconBase name="user" :size="12" />
              {{ t('drives.conflictSeller') }} ·
              {{ sellerById(dealer.sellers, conflicts.get(drive.id)!.seller!.sellerId)?.name ?? '—' }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    <div v-else class="surface-card rounded-2xl border">
      <EmptyState icon="calendar" :title="t('drives.empty')" :description="t('drives.emptyDesc')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { dayKey } from '@/data/mock'
import { customerById, driveConflict, drivesOfDay, sellerById, vehicleById, vehicleLabel } from '@/data/query'
import { formatDate } from '@/lib/format'
import PageHeader from '@/components/app/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconBase from '@/components/ui/IconBase.vue'
import Avatar from '@/components/ui/Avatar.vue'
import DriveStatusPill from '@/components/dl/DriveStatusPill.vue'
import type { DriveStatus, TestDrive } from '@/data/types'

const RANGE = 14

const { t, locale } = useI18n()
usePageTitle(() => t('drives.title'))

const dealer = useDealerStore()
const ui = useUiStore()

const offset = ref(0)
const date = computed(() => dayKey(offset.value))

const days = Array.from({ length: RANGE }, (_, i) => i - 3)
const rows = computed(() => drivesOfDay(dealer.drives, date.value))

/** Os choques do dia, apontados separadamente para veículo e vendedor. */
const conflicts = computed(() => {
  const map = new Map<number, { vehicle?: TestDrive; seller?: TestDrive }>()
  for (const drive of rows.value) {
    const clash = driveConflict(drive, dealer.drives)
    if (clash.vehicle || clash.seller) map.set(drive.id, clash)
  }
  return map
})

const dayCount = (o: number) => drivesOfDay(dealer.drives, dayKey(o)).length

const vehicleOf = (id: number) => vehicleById(dealer.vehicles, id)

function vehicleNameOf(id: number): string {
  const vehicle = vehicleOf(id)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
}

function update(id: number, status: DriveStatus) {
  dealer.setDriveStatus(id, status)
  ui.notifySuccess(t('drives.updated'))
}
</script>
