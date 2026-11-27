<template>
  <div>
    <p class="mb-3 flex items-center gap-1.5 text-xs text-muted">
      <IconBase name="info" :size="14" />
      {{ t('deals.approvedNote') }}
    </p>

    <div class="no-scrollbar flex gap-4 overflow-x-auto pb-2">
      <section
        v-for="column in columns"
        :key="column.stage"
        class="flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition"
        :class="over === column.stage ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10' : 'surface-card'"
        @dragover.prevent="over = column.stage"
        @dragleave="over = over === column.stage ? null : over"
        @drop="drop(column.stage)"
      >
        <header class="mb-3 flex items-center gap-2">
          <span :class="`h-2.5 w-2.5 rounded-full ${STAGE_TONE[column.stage]}`" />
          <h3 class="text-sm font-semibold text-heading">{{ t(`status.deal.${column.stage}`) }}</h3>
          <span
            class="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {{ column.rows.length }}
          </span>
        </header>
        <p class="mb-3 text-[11px] text-muted">
          {{ t('deals.stageValue') }}: {{ formatCurrency(column.total, locale) }}
        </p>

        <ul class="flex max-h-[62vh] flex-col gap-2 overflow-y-auto pr-0.5">
          <li
            v-for="deal in column.rows"
            :key="deal.id"
            draggable="true"
            class="surface-card cursor-grab rounded-xl border p-3 transition active:cursor-grabbing"
            :class="dragging === deal.id ? 'opacity-40' : 'hover:shadow-theme-sm'"
            @dragstart="dragging = deal.id"
            @dragend="dragging = null"
          >
            <RouterLink :to="`/app/proposta/${deal.id}`" class="block">
              <p class="line-clamp-2 text-sm font-medium text-heading">{{ labelOf(deal) }}</p>
              <p class="mt-1 text-sm font-bold text-brand-600 dark:text-brand-400">
                {{ formatCurrency(dealPrice(deal, vehicleOf(deal)), locale) }}
              </p>
              <p v-if="deal.discount > 0" class="text-[11px] text-muted">
                {{ t('deal.discount') }}: {{ formatCurrency(deal.discount, locale) }}
              </p>
            </RouterLink>

            <div class="mt-3 flex items-center gap-2 border-t border-themed pt-2.5">
              <Avatar :src="sellerOf(deal)?.avatar" :name="sellerOf(deal)?.name" size="xs" />
              <span class="min-w-0 flex-1 truncate text-[11px] text-muted">{{ customerOf(deal)?.name ?? '—' }}</span>
              <IconBase v-if="deal.tradeInId" name="refresh-cw" :size="12" class-name="text-brand-500" />
              <IconBase v-if="deal.finance" name="credit-card" :size="12" class-name="text-muted" />
            </div>
          </li>
          <li
            v-if="!column.rows.length"
            class="rounded-xl border border-dashed border-themed px-3 py-6 text-center text-xs text-muted"
          >
            {{ t('deals.emptyColumn') }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDealerStore } from '@/stores/dealer'
import { useUiStore } from '@/stores/ui'
import { customerById, dealPrice, dealsOfStage, sellerById, STAGES, vehicleById, vehicleLabel } from '@/data/query'
import { formatCurrency } from '@/lib/format'
import Avatar from '@/components/ui/Avatar.vue'
import IconBase from '@/components/ui/IconBase.vue'
import type { Deal, DealStage } from '@/data/types'

const STAGE_TONE: Record<DealStage, string> = {
  contato: 'bg-gray-400',
  proposta: 'bg-brand-500',
  negociacao: 'bg-warning-500',
  aprovada: 'bg-success-500',
  perdida: 'bg-error-500',
}

/**
 * Funil arrastável. A coluna `aprovada` não é só um rótulo: soltar um card
 * nela reserva o veículo e ele sai da vitrine; tirar de lá devolve o carro,
 * sem zerar os dias em estoque.
 */
const { t, locale } = useI18n()
const dealer = useDealerStore()
const ui = useUiStore()

const dragging = ref<number | null>(null)
const over = ref<DealStage | null>(null)

const columns = computed(() =>
  STAGES.map((stage) => {
    const rows = dealsOfStage(dealer.deals, stage)
    return {
      stage,
      rows,
      total: rows.reduce((sum, d) => sum + dealPrice(d, vehicleById(dealer.vehicles, d.vehicleId)), 0),
    }
  })
)

const vehicleOf = (deal: Deal) => vehicleById(dealer.vehicles, deal.vehicleId)
const customerOf = (deal: Deal) => customerById(dealer.customers, deal.customerId)
const sellerOf = (deal: Deal) => sellerById(dealer.sellers, deal.sellerId)

function labelOf(deal: Deal): string {
  const vehicle = vehicleOf(deal)
  return vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : '—'
}

function drop(stage: DealStage) {
  over.value = null
  if (dragging.value === null) return
  const deal = dealer.deals.find((d) => d.id === dragging.value)
  dragging.value = null
  if (!deal || deal.stage === stage) return

  const vehicle = vehicleById(dealer.vehicles, deal.vehicleId)
  const name = vehicle ? vehicleLabel(dealer.models, dealer.brands, vehicle) : t('common.vehicle')
  const wasApproved = deal.stage === 'aprovada'
  const wasAvailable = vehicle?.state === 'disponivel'
  const wasReserved = vehicle?.state === 'reservado'

  dealer.moveDeal(deal.id, stage)
  ui.notify(t('deals.moved', { stage: t(`status.deal.${stage}`) }), 'info')

  if (stage === 'aprovada' && wasAvailable) {
    ui.notify(t('deals.reserved', { name }), 'warning')
  }
  if (wasApproved && stage !== 'aprovada' && wasReserved) {
    ui.notify(t('deals.released', { name }), 'success')
  }
}
</script>
