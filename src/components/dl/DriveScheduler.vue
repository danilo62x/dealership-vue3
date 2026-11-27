<template>
  <div v-if="booked" class="surface-card rounded-2xl border p-6 text-center md:p-8">
    <span
      class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/15"
    >
      <IconBase name="check-circle" :size="30" />
    </span>
    <h3 class="mt-5 text-lg font-semibold text-heading">
      {{ t('drive.success', { date: formatDate(`${booked.date}T12:00:00`, locale), time: booked.from }) }}
    </h3>
    <dl class="mx-auto mt-6 max-w-sm space-y-2.5 text-left text-sm">
      <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
        <dt class="text-muted">{{ t('common.vehicle') }}</dt>
        <dd class="font-medium text-heading">{{ bookedVehicleLabel }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
        <dt class="text-muted">{{ t('common.seller') }}</dt>
        <dd class="font-medium text-heading">{{ sellerById(dealer.sellers, booked.sellerId)?.name ?? '—' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-themed pt-2.5">
        <dt class="text-muted">{{ t('common.customer') }}</dt>
        <dd class="font-medium text-heading">{{ customerById(dealer.customers, booked.customerId)?.name ?? '—' }}</dd>
      </div>
    </dl>
  </div>

  <div v-else class="space-y-5">
    <!-- ---- Passos ---- -->
    <ol class="grid gap-3 sm:grid-cols-3">
      <li
        v-for="(label, i) in stepLabels"
        :key="label"
        class="flex items-center gap-3 rounded-xl border p-3.5"
        :class="step === i ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed'"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          :class="step >= i ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'"
        >
          {{ i + 1 }}
        </span>
        <span class="text-sm font-medium text-heading">{{ label }}</span>
      </li>
    </ol>

    <div class="surface-card rounded-2xl border p-5 md:p-6">
      <!-- ---- 1. Veículo ---- -->
      <div v-if="step === 0">
        <h3 class="font-semibold text-heading">{{ t('drive.chooseVehicle') }}</h3>
        <div class="mt-4 grid max-h-96 gap-3 overflow-y-auto sm:grid-cols-2">
          <button
            v-for="v in showcase.slice(0, 24)"
            :key="v.id"
            type="button"
            class="flex items-center gap-3 rounded-xl border p-3 text-left transition"
            :class="
              vehicleId === v.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed hover:border-brand-300'
            "
            @click="vehicleId = v.id"
          >
            <img
              :src="dlImage(v.photoSeeds[0] ?? v.slug, 160, 120)"
              alt=""
              loading="lazy"
              class="h-12 w-16 shrink-0 rounded-lg object-cover"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-heading">
                {{ vehicleLabel(dealer.models, dealer.brands, v) }}
              </span>
              <span class="block text-xs text-muted">{{ v.modelYear }}</span>
            </span>
          </button>
        </div>
        <button
          type="button"
          class="focus-ring mt-5 flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="step = 1"
        >
          {{ t('drive.nextStep') }}
          <IconBase name="arrow-right" :size="16" />
        </button>
      </div>

      <!-- ---- 2. Dia, vendedor e horário ---- -->
      <div v-else-if="step === 1" class="space-y-5">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-heading" for="dr-seller">
            {{ t('drive.chooseSeller') }}
          </label>
          <select
            id="dr-seller"
            :value="sellerId"
            :class="control"
            @change="sellerId = Number(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="s in dealer.sellers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('drive.chooseDay') }}</span>
          <div class="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="offset in days"
              :key="offset"
              type="button"
              class="shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition"
              :class="dayOffset === offset ? 'border-brand-500 bg-brand-500 text-white' : 'border-themed text-body'"
              @click="dayOffset = offset"
            >
              <span class="block text-xs opacity-80">
                {{ offset === 0 ? t('common.today') : offset === 1 ? t('common.tomorrow') : '' }}
              </span>
              <span class="block text-sm font-semibold">{{ formatDate(`${dayKey(offset)}T12:00:00`, locale) }}</span>
            </button>
          </div>
        </div>

        <div>
          <span class="mb-1.5 block text-sm font-medium text-heading">{{ t('drive.chooseSlot') }}</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="row in slotRows"
              :key="row.from"
              type="button"
              :disabled="row.busy"
              :title="row.busy ? t('drive.slotTaken') : undefined"
              class="focus-ring rounded-lg border px-3.5 py-2 text-sm font-medium transition"
              :class="
                row.busy
                  ? 'cursor-not-allowed border-themed text-muted line-through opacity-50'
                  : slot === row.from
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-themed text-body hover:text-heading'
              "
              @click="slot = row.from"
            >
              {{ row.from }}
            </button>
          </div>
          <p v-if="allBusy" class="mt-2 text-xs text-error-600 dark:text-error-500">{{ t('drive.noSlots') }}</p>
        </div>

        <!-- Aviso ao vivo: os dois choques aparecem separados. -->
        <div
          v-if="liveClash.vehicle || liveClash.seller"
          class="rounded-xl border border-warning-200 bg-warning-50 p-3.5 text-sm dark:border-warning-500/30 dark:bg-warning-500/10"
        >
          <p v-if="liveClash.vehicle" class="flex items-start gap-2 text-warning-700 dark:text-warning-500">
            <IconBase name="car" :size="15" class-name="mt-0.5" />
            {{ t('drive.conflictVehicle', { time: `${liveClash.vehicle.from}–${liveClash.vehicle.to}` }) }}
          </p>
          <p v-if="liveClash.seller" class="mt-1.5 flex items-start gap-2 text-warning-700 dark:text-warning-500">
            <IconBase name="user" :size="15" class-name="mt-0.5" />
            {{ t('drive.conflictSeller', { name: sellerById(dealer.sellers, liveClash.seller.sellerId)?.name ?? '—' }) }}
          </p>
        </div>
        <p
          v-if="!liveClash.vehicle && !liveClash.seller"
          class="flex items-center gap-2 text-sm text-success-600 dark:text-success-500"
        >
          <IconBase name="check-circle" :size="15" />
          {{ t('drive.bothFree') }}
        </p>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="focus-ring flex h-11 items-center rounded-lg border border-themed px-5 text-sm font-medium text-body"
            @click="step = 0"
          >
            {{ t('drive.back') }}
          </button>
          <button
            type="button"
            class="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            @click="step = 2"
          >
            {{ t('drive.nextStep') }}
            <IconBase name="arrow-right" :size="16" />
          </button>
        </div>
      </div>

      <!-- ---- 3. Dados e CNH ---- -->
      <div v-else class="space-y-4">
        <div class="rounded-xl border border-themed p-3.5 text-sm">
          <p class="font-medium text-heading">{{ chosenVehicleLabel }}</p>
          <p class="text-xs text-muted">
            {{ formatDate(`${date}T12:00:00`, locale) }} · {{ slot }}–{{ plusHour(slot) }} ·
            {{ sellerById(dealer.sellers, sellerId)?.name ?? '—' }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="dr-name">{{ t('drive.yourName') }}</label>
            <input id="dr-name" v-model="name" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="dr-phone">
              {{ t('drive.yourPhone') }}
            </label>
            <input id="dr-phone" v-model="phone" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="dr-email">
              {{ t('drive.yourEmail') }}
            </label>
            <input id="dr-email" v-model="email" type="email" :class="control" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-heading" for="dr-cnh">{{ t('drive.cnh') }}</label>
            <input id="dr-cnh" v-model="cnhUntil" type="date" :class="control" />
            <p class="mt-1 text-xs text-muted">{{ t('drive.cnhHint') }}</p>
          </div>
        </div>

        <div
          v-if="conflict?.vehicle || conflict?.seller || cnhRefused"
          class="rounded-xl border border-error-200 bg-error-50 p-4 text-sm dark:border-error-500/30 dark:bg-error-500/10"
        >
          <p class="font-semibold text-error-700 dark:text-error-500">{{ t('drive.refusedTitle') }}</p>
          <ul class="mt-2 space-y-1.5 text-error-600 dark:text-error-500">
            <li v-if="conflict?.vehicle" class="flex items-start gap-2">
              <IconBase name="car" :size="15" class-name="mt-0.5" />
              {{ t('drive.conflictVehicle', { time: `${conflict.vehicle.from}–${conflict.vehicle.to}` }) }}
            </li>
            <li v-if="conflict?.seller" class="flex items-start gap-2">
              <IconBase name="user" :size="15" class-name="mt-0.5" />
              {{ t('drive.conflictSeller', { name: sellerById(dealer.sellers, conflict.seller.sellerId)?.name ?? '—' }) }}
            </li>
            <li v-if="cnhRefused" class="flex items-start gap-2">
              <IconBase name="ban" :size="15" class-name="mt-0.5" />
              {{ t('drive.conflictCnh') }}
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="focus-ring flex h-11 items-center rounded-lg border border-themed px-5 text-sm font-medium text-body"
            @click="step = 1"
          >
            {{ t('drive.back') }}
          </button>
          <button
            type="button"
            class="focus-ring flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            @click="submit"
          >
            <IconBase name="calendar" :size="16" />
            {{ t('drive.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { dayKey, dlImage } from '@/data/mock'
import { availableStock, driveConflict, customerById, sellerById, vehicleById, vehicleLabel } from '@/data/query'
import { formatDate } from '@/lib/format'
import IconBase from '@/components/ui/IconBase.vue'
import type { DriveConflict, TestDrive } from '@/data/types'

const SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
const DAYS_AHEAD = 10

const plusHour = (from: string) => `${String(Number(from.slice(0, 2)) + 1).padStart(2, '0')}:${from.slice(3)}`

/**
 * Agendamento em três passos. O horário só é aceito quando está livre para o
 * VEÍCULO e para o VENDEDOR — e a recusa diz qual dos dois bateu, separado da
 * recusa por CNH.
 */
const props = defineProps<{ initialVehicleId?: number }>()

const { t, locale } = useI18n()
const dealer = useDealerStore()
const ui = useUiStore()

const showcase = computed(() => availableStock(dealer.vehicles).filter((v) => v.state === 'disponivel'))

const step = ref(props.initialVehicleId ? 1 : 0)
const vehicleId = ref(props.initialVehicleId ?? showcase.value[0]?.id ?? 0)
const sellerId = ref(dealer.sellers[0]?.id ?? 0)
const dayOffset = ref(1)
const slot = ref('10:00')

const name = ref('')
const email = ref('')
const phone = ref('')
const cnhUntil = ref('')

const conflict = ref<DriveConflict | null>(null)
const cnhRefused = ref(false)
const booked = ref<TestDrive | null>(null)

const stepLabels = computed(() => [t('drive.step1'), t('drive.step2'), t('drive.step3')])
const date = computed(() => dayKey(dayOffset.value))
const days = Array.from({ length: DAYS_AHEAD }, (_, i) => i)

function slotState(from: string): DriveConflict {
  return driveConflict(
    { vehicleId: vehicleId.value, sellerId: sellerId.value, customerId: 0, date: date.value, from, to: plusHour(from) },
    dealer.drives
  )
}

const slotRows = computed(() =>
  SLOTS.map((from) => {
    const clash = slotState(from)
    return { from, busy: Boolean(clash.vehicle || clash.seller) }
  })
)

const allBusy = computed(() => slotRows.value.every((row) => row.busy))

/** Choques do slot escolhido, calculados ao vivo enquanto o visitante escolhe. */
const liveClash = computed(() => slotState(slot.value))

const chosenVehicleLabel = computed(() => {
  const vehicle = vehicleById(dealer.vehicles, vehicleId.value)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
})

const bookedVehicleLabel = computed(() => {
  if (!booked.value) return '—'
  const vehicle = vehicleById(dealer.vehicles, booked.value.vehicleId)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
})

function submit() {
  conflict.value = null
  cnhRefused.value = false

  const customer = dealer.saveCustomer({
    name: name.value || 'Visitante',
    email: email.value,
    phone: phone.value,
    cnhUntil: cnhUntil.value ? new Date(`${cnhUntil.value}T12:00:00`).toISOString() : null,
  })

  const result = dealer.scheduleDrive({
    vehicleId: vehicleId.value,
    customerId: customer.id,
    sellerId: sellerId.value,
    date: date.value,
    from: slot.value,
    to: plusHour(slot.value),
  })

  if (result.ok && result.drive) {
    booked.value = result.drive
    ui.notify(
      t('drive.success', { date: formatDate(`${date.value}T12:00:00`, locale.value), time: slot.value }),
      'success'
    )
    return
  }

  conflict.value = { vehicle: result.vehicleClash, seller: result.sellerClash }
  cnhRefused.value = !result.cnhOk
}

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body'
</script>
