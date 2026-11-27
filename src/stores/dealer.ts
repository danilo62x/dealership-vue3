import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RULES, seedData, slugify } from '@/data/mock'
import { driveConflict, cnhValid, customerById, modelById, vehicleById } from '@/data/query'
import type {
  Brand,
  Customer,
  Deal,
  DealStage,
  Model,
  Rules,
  Seller,
  StockState,
  TestDrive,
  TradeIn,
  Vehicle,
} from '@/data/types'

/**
 * A semente nasce com datas relativas a hoje. Se a demonstração ficar guardada
 * no navegador por dias, a agenda de test-drive e o funil de 90 dias saem do
 * lugar — por isso a base é refeita depois de algumas horas.
 */
const SEED_TTL_MS = 6 * 3_600_000

const nextId = (list: { id: number }[]) => (list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1)

export interface DriveRequest {
  vehicleId: number
  customerId: number
  sellerId: number
  date: string
  from: string
  to: string
}

/**
 * O agendamento devolve os três motivos de recusa separados: a agenda do
 * veículo, a agenda do vendedor e a CNH. A tela mostra qual deles bateu.
 */
export interface DriveResult {
  ok: boolean
  cnhOk: boolean
  vehicleClash?: TestDrive
  sellerClash?: TestDrive
  drive?: TestDrive
}

export const useDealerStore = defineStore(
  'dl-data',
  () => {
    const seed = seedData()

    const brands = ref<Brand[]>(seed.brands)
    const models = ref<Model[]>(seed.models)
    const vehicles = ref<Vehicle[]>(seed.vehicles)
    const customers = ref<Customer[]>(seed.customers)
    const sellers = ref<Seller[]>(seed.sellers)
    const deals = ref<Deal[]>(seed.deals)
    const tradeIns = ref<TradeIn[]>(seed.tradeIns)
    const drives = ref<TestDrive[]>(seed.drives)
    const rules = ref<Rules>(seed.rules)
    const seededAt = ref<number>(seed.seededAt)

    // ---- estoque --------------------------------------------------------

    function saveVehicle(patch: Partial<Vehicle> & { id?: number }): Vehicle {
      if (patch.id) {
        vehicles.value = vehicles.value.map((v) => (v.id === patch.id ? { ...v, ...patch } : v))
        return vehicles.value.find((v) => v.id === patch.id)!
      }

      const id = nextId(vehicles.value)
      const model = modelById(models.value, patch.modelId ?? models.value[0].id)
      const brand = brands.value.find((b) => b.id === model?.brandId)
      const version = patch.version ?? 'Padrão'
      const modelYear = patch.modelYear ?? patch.year ?? new Date().getFullYear()
      const slug = `${brand?.slug ?? 'veiculo'}-${slugify(model?.name ?? 'modelo')}-${slugify(version)}-${modelYear}-${id}`

      const created: Vehicle = {
        id,
        slug,
        modelId: model?.id ?? 1,
        version,
        year: patch.year ?? modelYear,
        modelYear,
        km: patch.km ?? 0,
        color: patch.color ?? 'Branco',
        plateEnd: patch.plateEnd ?? '0',
        transmission: patch.transmission ?? 'manual',
        fuel: patch.fuel ?? 'flex',
        doors: patch.doors ?? 4,
        options: patch.options ?? [],
        photoSeeds: patch.photoSeeds ?? [`${slug}-a`, `${slug}-b`, `${slug}-c`],
        acquisitionCost: patch.acquisitionCost ?? 0,
        prepCost: patch.prepCost ?? 0,
        price: patch.price ?? 0,
        state: patch.state ?? 'preparacao',
        // A entrada define o início da contagem de dias em estoque.
        arrivedAt: patch.arrivedAt ?? new Date().toISOString(),
        soldAt: null,
      }
      vehicles.value = [...vehicles.value, created]
      return created
    }

    function removeVehicle(id: number) {
      vehicles.value = vehicles.value.filter((v) => v.id !== id)
      deals.value = deals.value.filter((d) => d.vehicleId !== id)
      drives.value = drives.value.filter((d) => d.vehicleId !== id)
    }

    function setVehicleState(id: number, state: StockState) {
      // `arrivedAt` nunca é tocado aqui: mudar de situação não zera os dias.
      vehicles.value = vehicles.value.map((v) =>
        v.id === id
          ? { ...v, state, soldAt: state === 'vendido' ? (v.soldAt ?? new Date().toISOString()) : null }
          : v
      )
    }

    // ---- propostas ------------------------------------------------------

    /**
     * Mover a proposta mexe no estoque: entrar em `aprovada` reserva o
     * veículo e ele some da vitrine; sair de `aprovada` libera. Em nenhum
     * dos dois caminhos `arrivedAt` muda — os dias em estoque continuam.
     */
    function moveDeal(id: number, stage: DealStage, lostReason?: string) {
      const deal = deals.value.find((d) => d.id === id)
      if (!deal || deal.stage === stage) return

      const entering = stage === 'aprovada'
      const leaving = deal.stage === 'aprovada'

      vehicles.value = vehicles.value.map((v) => {
        if (v.id !== deal.vehicleId) return v
        if (entering && v.state === 'disponivel') return { ...v, state: 'reservado' as StockState }
        if (leaving && v.state === 'reservado') return { ...v, state: 'disponivel' as StockState }
        return v
      })

      deals.value = deals.value.map((d) =>
        d.id === id
          ? {
              ...d,
              stage,
              movedAt: new Date().toISOString(),
              lostReason: stage === 'perdida' ? (lostReason ?? d.lostReason ?? '') : undefined,
            }
          : d
      )
    }

    function saveDeal(patch: Partial<Deal> & { id?: number }): Deal {
      if (patch.id) {
        deals.value = deals.value.map((d) => (d.id === patch.id ? { ...d, ...patch } : d))
        return deals.value.find((d) => d.id === patch.id)!
      }
      const now = new Date().toISOString()
      const created: Deal = {
        id: nextId(deals.value),
        vehicleId: patch.vehicleId ?? 0,
        customerId: patch.customerId ?? 0,
        sellerId: patch.sellerId ?? sellers.value[0].id,
        stage: patch.stage ?? 'contato',
        createdAt: patch.createdAt ?? now,
        movedAt: patch.movedAt ?? now,
        discount: patch.discount ?? 0,
        tradeInId: patch.tradeInId ?? null,
        finance: patch.finance ?? null,
      }
      deals.value = [...deals.value, created]
      return created
    }

    function removeDeal(id: number) {
      const deal = deals.value.find((d) => d.id === id)
      if (deal && deal.stage === 'aprovada') {
        vehicles.value = vehicles.value.map((v) =>
          v.id === deal.vehicleId && v.state === 'reservado' ? { ...v, state: 'disponivel' as StockState } : v
        )
      }
      deals.value = deals.value.filter((d) => d.id !== id)
    }

    /** Fecha a venda de uma proposta aprovada: o veículo sai do estoque. */
    function closeSale(dealId: number) {
      const deal = deals.value.find((d) => d.id === dealId)
      if (!deal || deal.stage !== 'aprovada') return
      const now = new Date().toISOString()
      vehicles.value = vehicles.value.map((v) =>
        v.id === deal.vehicleId ? { ...v, state: 'vendido' as StockState, soldAt: v.soldAt ?? now } : v
      )
    }

    // ---- trocas ---------------------------------------------------------

    function saveTradeIn(patch: Partial<TradeIn> & { id?: number }): TradeIn {
      if (patch.id) {
        tradeIns.value = tradeIns.value.map((t) => (t.id === patch.id ? { ...t, ...patch } : t))
        return tradeIns.value.find((t) => t.id === patch.id)!
      }
      const created: TradeIn = {
        id: nextId(tradeIns.value),
        dealId: patch.dealId ?? null,
        customerId: patch.customerId ?? 0,
        modelId: patch.modelId ?? models.value[0].id,
        year: patch.year ?? new Date().getFullYear() - 3,
        km: patch.km ?? 0,
        condition: patch.condition ?? 'bom',
        options: patch.options ?? [],
        accepted: patch.accepted ?? false,
        createdAt: patch.createdAt ?? new Date().toISOString(),
      }
      tradeIns.value = [...tradeIns.value, created]
      return created
    }

    function setTradeInAccepted(id: number, accepted: boolean) {
      tradeIns.value = tradeIns.value.map((t) => (t.id === id ? { ...t, accepted } : t))
    }

    // ---- test-drives ----------------------------------------------------

    function scheduleDrive(input: DriveRequest): DriveResult {
      const customer = customerById(customers.value, input.customerId)
      const clash = driveConflict(input, drives.value)
      const cnhOk = cnhValid(customer, input.date)

      if (clash.vehicle || clash.seller || !cnhOk) {
        return { ok: false, cnhOk, vehicleClash: clash.vehicle, sellerClash: clash.seller }
      }

      const drive: TestDrive = {
        id: nextId(drives.value),
        vehicleId: input.vehicleId,
        customerId: input.customerId,
        sellerId: input.sellerId,
        date: input.date,
        from: input.from,
        to: input.to,
        status: 'agendado',
        cnhOk: true,
      }
      drives.value = [...drives.value, drive]
      return { ok: true, cnhOk: true, drive }
    }

    function setDriveStatus(id: number, status: TestDrive['status']) {
      drives.value = drives.value.map((d) => (d.id === id ? { ...d, status } : d))
    }

    // ---- clientes -------------------------------------------------------

    function saveCustomer(patch: Partial<Customer> & { id?: number }): Customer {
      if (patch.id) {
        customers.value = customers.value.map((c) => (c.id === patch.id ? { ...c, ...patch } : c))
        return customers.value.find((c) => c.id === patch.id)!
      }
      const created: Customer = {
        id: nextId(customers.value),
        name: patch.name ?? 'Novo cliente',
        email: patch.email ?? '',
        phone: patch.phone ?? '',
        document: patch.document ?? '',
        avatar: patch.avatar ?? '',
        cnhUntil: patch.cnhUntil ?? null,
        createdAt: patch.createdAt ?? new Date().toISOString(),
      }
      customers.value = [...customers.value, created]
      return created
    }

    function removeCustomer(id: number) {
      customers.value = customers.value.filter((c) => c.id !== id)
    }

    // ---- regras ---------------------------------------------------------

    function saveRules(patch: Partial<Rules>) {
      rules.value = { ...rules.value, ...patch }
    }

    function reset() {
      const fresh = seedData()
      brands.value = fresh.brands
      models.value = fresh.models
      vehicles.value = fresh.vehicles
      customers.value = fresh.customers
      sellers.value = fresh.sellers
      deals.value = fresh.deals
      tradeIns.value = fresh.tradeIns
      drives.value = fresh.drives
      rules.value = RULES
      seededAt.value = fresh.seededAt
    }

    return {
      brands,
      models,
      vehicles,
      customers,
      sellers,
      deals,
      tradeIns,
      drives,
      rules,
      seededAt,
      saveVehicle,
      removeVehicle,
      setVehicleState,
      moveDeal,
      saveDeal,
      removeDeal,
      closeSale,
      saveTradeIn,
      setTradeInAccepted,
      scheduleDrive,
      setDriveStatus,
      saveCustomer,
      removeCustomer,
      saveRules,
      reset,
    }
  },
  {
    persist: {
      key: 'dl-data',
      pick: [
        'brands',
        'models',
        'vehicles',
        'customers',
        'sellers',
        'deals',
        'tradeIns',
        'drives',
        'rules',
        'seededAt',
      ],
      // Semente velha = agenda e funil fora do lugar: melhor recomeçar.
      // O `$persist` é obrigatório aqui: o plugin só assina as mutações depois
      // do `afterHydrate`, então sem ele a base velha continuaria no storage.
      afterHydrate(ctx) {
        const store = ctx.store as unknown as { seededAt: number; reset: () => void; $persist?: () => void }
        if (Date.now() - store.seededAt > SEED_TTL_MS) {
          store.reset()
          store.$persist?.()
        }
      },
    },
  }
)

/** Atalho: o veículo de uma proposta. */
export function dealVehicle(deal: Deal, vehicles: Vehicle[]): Vehicle | undefined {
  return vehicleById(vehicles, deal.vehicleId)
}
