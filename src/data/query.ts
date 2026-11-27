import type {
  Adjustment,
  Appraisal,
  Brand,
  Condition,
  Customer,
  Deal,
  DealStage,
  DriveConflict,
  FinanceStep,
  FunnelRow,
  Model,
  Rules,
  Seller,
  SellerPerformance,
  SeriesPoint,
  Simulation,
  SlowMover,
  StockSort,
  TestDrive,
  TradeIn,
  Vehicle,
} from './types'

const DAY = 86_400_000

// ---------------------------------------------------------------------------
// Buscas simples
// ---------------------------------------------------------------------------

export const brandById = (list: Brand[], id: number) => list.find((b) => b.id === id)
export const modelById = (list: Model[], id: number) => list.find((m) => m.id === id)
export const vehicleById = (list: Vehicle[], id: number) => list.find((v) => v.id === id)
export const vehicleBySlug = (list: Vehicle[], slug: string) => list.find((v) => v.slug === slug)
export const customerById = (list: Customer[], id: number) => list.find((c) => c.id === id)
export const sellerById = (list: Seller[], id: number) => list.find((s) => s.id === id)
export const dealById = (list: Deal[], id: number) => list.find((d) => d.id === id)
export const tradeInById = (list: TradeIn[], id: number) => list.find((t) => t.id === id)

/** "Aurex Lumia" — marca + modelo. */
export function modelLabel(models: Model[], brands: Brand[], modelId: number): string {
  const model = modelById(models, modelId)
  if (!model) return '—'
  const brand = brandById(brands, model.brandId)
  return brand ? `${brand.name} ${model.name}` : model.name
}

/** "Aurex Lumia 1.0 Turbo" — o nome que aparece em toda listagem. */
export function vehicleLabel(models: Model[], brands: Brand[], vehicle: Vehicle): string {
  return `${modelLabel(models, brands, vehicle.modelId)} ${vehicle.version}`.trim()
}

/** "2021/2022" — ano de fabricação e ano-modelo. */
export function yearLabel(vehicle: Vehicle): string {
  return vehicle.year === vehicle.modelYear ? String(vehicle.year) : `${vehicle.year}/${vehicle.modelYear}`
}

// ===========================================================================
// 1. FINANCIAMENTO — Tabela Price com memória do cálculo e CET
// ===========================================================================

/**
 * Parcela da Tabela Price: `PMT = PV × i / (1 − (1+i)^−n)`.
 * Com juros zero a parcela é a divisão simples — o denominador zeraria.
 */
export function pmt(pv: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0
  if (monthlyRate === 0) return pv / months
  return (pv * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
}

/**
 * Taxa mensal efetiva que iguala o dinheiro que o cliente REALMENTE recebe
 * (financiado menos tarifa e IOF) ao fluxo das parcelas. É daqui que sai o
 * CET: bisseção simples, sem dependência externa.
 */
function effectiveMonthlyRate(net: number, installment: number, months: number): number {
  if (net <= 0 || installment <= 0 || months <= 0) return 0
  let low = 0
  let high = 1
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2
    const value = mid === 0 ? installment * months : (installment * (1 - Math.pow(1 + mid, -months))) / mid
    if (value > net) low = mid
    else high = mid
  }
  return (low + high) / 2
}

/** Entrada mínima exigida pelo estoque. O simulador nunca desce disso. */
export function minDown(price: number, rules: Rules): number {
  return Math.round(price * rules.minDownPct)
}

export interface SimulateInput {
  price: number
  down: number
  months: number
  rate: number
  /** Troca aprovada abate a entrada do carro novo. */
  tradeIn?: number
}

/**
 * Simulação completa. Devolve os números E a memória do cálculo linha a linha
 * — é a memória que a tela imprime, não um resumo escrito à mão.
 */
export function simulate(input: SimulateInput, rules: Rules): Simulation {
  const price = Math.max(0, input.price)
  const tradeIn = Math.max(0, input.tradeIn ?? 0)
  const down = Math.max(0, Math.min(input.down + tradeIn, price))
  const months = Math.max(1, Math.round(input.months))
  const i = Math.max(0, input.rate)

  const financed = Math.max(0, price - down)
  const installment = pmt(financed, i, months)
  const total = installment * months
  const interest = total - financed

  const fees = financed > 0 ? rules.registrationFee : 0
  // IOF aproximado: a alíquota anual proporcional ao prazo, limitada a 12 meses.
  const iof = financed * rules.iocPct * (Math.min(months, 12) / 12)

  const net = financed - fees - iof
  const monthlyCet = effectiveMonthlyRate(net, installment, months)
  const cet = Math.pow(1 + monthlyCet, 12) - 1

  const pct = (v: number) => `${(v * 100).toFixed(2).replace('.', ',')}%`
  const brl = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const steps: FinanceStep[] = [
    {
      key: 'financed',
      formula: `${brl(price)} − ${brl(down)}`,
      value: financed,
      kind: 'money',
    },
    { key: 'rate', formula: `i = ${pct(i)} a.m.`, value: i, kind: 'rate' },
    { key: 'months', formula: `n = ${months}`, value: months, kind: 'plain' },
    {
      key: 'factor',
      formula: `(1 + ${pct(i)})^−${months} = ${Math.pow(1 + i, -months).toFixed(6).replace('.', ',')}`,
      value: Math.pow(1 + i, -months),
      kind: 'plain',
    },
    {
      key: 'installment',
      formula: `${brl(financed)} × ${pct(i)} ÷ (1 − ${Math.pow(1 + i, -months).toFixed(6).replace('.', ',')})`,
      value: installment,
      kind: 'money',
    },
    { key: 'total', formula: `${brl(installment)} × ${months}`, value: total, kind: 'money' },
    { key: 'interest', formula: `${brl(total)} − ${brl(financed)}`, value: interest, kind: 'money' },
    { key: 'fee', formula: `${brl(rules.registrationFee)}`, value: fees, kind: 'money' },
    {
      key: 'iof',
      formula: `${brl(financed)} × ${pct(rules.iocPct)} × ${Math.min(months, 12)}/12`,
      value: iof,
      kind: 'money',
    },
    {
      key: 'cet',
      formula: `(1 + ${pct(monthlyCet)})^12 − 1`,
      value: cet,
      kind: 'rate',
    },
  ]

  return {
    price,
    down,
    months,
    monthlyRate: i,
    financed,
    installment,
    total,
    interest,
    fees,
    iof,
    cet,
    steps,
  }
}

// ===========================================================================
// 2. AVALIAÇÃO DE TROCA — cada ajuste em R$, nada escondido
// ===========================================================================

export interface AppraiseInput {
  modelId: number
  year: number
  km: number
  condition: Condition
  options: string[]
}

/**
 * Parte do valor de referência 0 km do modelo e desce até o valor da troca,
 * registrando CADA ajuste em reais. `at` é o "agora" resolvido pela página —
 * a função nunca chama `Date.now()` por conta própria.
 */
export function appraise(input: AppraiseInput, models: Model[], rules: Rules, at: number): Appraisal {
  const model = modelById(models, input.modelId)
  const reference = model?.referenceNew ?? 0
  const currentYear = new Date(at).getFullYear()
  const age = Math.max(0, currentYear - input.year)

  const adjustments: Adjustment[] = []

  // a) depreciação por ano de uso
  const afterAge = reference * Math.pow(1 - rules.depreciationPerYear, age)
  adjustments.push({
    key: 'depreciation',
    detail: String(age),
    amount: Math.round(afterAge - reference),
  })

  // b) km rodado contra a média anual esperada
  const expectedKm = age * rules.kmPerYearRef
  const kmDiff = input.km - expectedKm
  const kmAmount = Math.round((-kmDiff / 1000) * rules.kmAdjustPer1000)
  adjustments.push({
    key: kmDiff >= 0 ? 'kmAbove' : 'kmBelow',
    detail: Math.abs(Math.round(kmDiff)).toLocaleString('pt-BR'),
    amount: kmAmount,
  })

  // c) estado de conservação
  const conditionAmount = Math.round(afterAge * rules.conditionAdjust[input.condition])
  adjustments.push({ key: `condition.${input.condition}`, detail: '', amount: conditionAmount })

  // d) opcionais valorizados
  const optionAmount = input.options.reduce((sum, opt) => sum + (rules.optionValue[opt] ?? 0), 0)
  adjustments.push({ key: 'options', detail: String(input.options.length), amount: optionAmount })

  const raw = reference + adjustments.reduce((sum, a) => sum + a.amount, 0)
  const floor = Math.round(reference * 0.12)
  const value = Math.max(floor, Math.round(raw / 100) * 100)

  return {
    reference,
    value,
    low: Math.round((value * 0.94) / 100) * 100,
    high: Math.round((value * 1.06) / 100) * 100,
    adjustments,
  }
}

/** Avaliação de uma troca já registrada. */
export function appraiseTradeIn(tradeIn: TradeIn, models: Model[], rules: Rules, at: number): Appraisal {
  return appraise(
    {
      modelId: tradeIn.modelId,
      year: tradeIn.year,
      km: tradeIn.km,
      condition: tradeIn.condition,
      options: tradeIn.options,
    },
    models,
    rules,
    at
  )
}

// ===========================================================================
// 3. TEST-DRIVE — agenda dupla (veículo E vendedor) + CNH
// ===========================================================================

const overlaps = (aFrom: string, aTo: string, bFrom: string, bTo: string) => aFrom < bTo && bFrom < aTo

/**
 * Aponta os dois choques SEPARADAMENTE: o horário pode estar livre para o
 * vendedor e ocupado para o veículo, e a tela precisa dizer qual dos dois é.
 */
export function driveConflict(drive: Omit<TestDrive, 'id' | 'status' | 'cnhOk'> & { id?: number }, drives: TestDrive[]): DriveConflict {
  const active = drives.filter((d) => d.id !== drive.id && d.date === drive.date && d.status !== 'cancelado')
  return {
    vehicle: active.find((d) => d.vehicleId === drive.vehicleId && overlaps(drive.from, drive.to, d.from, d.to)),
    seller: active.find((d) => d.sellerId === drive.sellerId && overlaps(drive.from, drive.to, d.from, d.to)),
  }
}

/** Sem CNH ou vencida na data do agendamento, o test-drive é recusado. */
export function cnhValid(customer: Customer | undefined, date: string): boolean {
  if (!customer || !customer.cnhUntil) return false
  return customer.cnhUntil.slice(0, 10) >= date
}

/** Agenda de um dia, em ordem de horário. */
export function drivesOfDay(drives: TestDrive[], date: string): TestDrive[] {
  return drives.filter((d) => d.date === date).sort((a, b) => a.from.localeCompare(b.from))
}

export function drivesOfVehicle(drives: TestDrive[], vehicleId: number): TestDrive[] {
  return drives
    .filter((d) => d.vehicleId === vehicleId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.from.localeCompare(a.from))
}

/** Horários livres do dia para um par veículo + vendedor. */
export function freeSlots(
  slots: string[],
  drives: TestDrive[],
  date: string,
  vehicleId: number,
  sellerId: number
): string[] {
  return slots.filter((from) => {
    const to = `${String(Number(from.slice(0, 2)) + 1).padStart(2, '0')}:${from.slice(3)}`
    const clash = driveConflict({ vehicleId, sellerId, customerId: 0, date, from, to }, drives)
    return !clash.vehicle && !clash.seller
  })
}

// ===========================================================================
// 4. ESTOQUE — a vitrine reflete o funil, sem zerar os dias em estoque
// ===========================================================================

/** A vitrine pública nunca mostra reservado nem vendido. */
export function availableStock(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.filter((v) => v.state !== 'reservado' && v.state !== 'vendido')
}

/**
 * Dias parados: da chegada até a venda, ou até `at` se ainda está na loja.
 * Uma proposta perdida devolve o veículo à vitrine SEM tocar em `arrivedAt`,
 * então o contador continua de onde parou.
 */
export function daysInStock(vehicle: Vehicle, at: number): number {
  const from = new Date(vehicle.arrivedAt).getTime()
  const to = vehicle.soldAt ? new Date(vehicle.soldAt).getTime() : at
  return Math.max(0, Math.floor((to - from) / DAY))
}

// ===========================================================================
// 5. MARGEM, COMISSÃO E GIRO LENTO
// ===========================================================================

/** Margem = venda − (custo de aquisição + preparação). */
export function margin(vehicle: Vehicle, salePrice: number): number {
  return salePrice - vehicle.acquisitionCost - vehicle.prepCost
}

export function marginPct(vehicle: Vehicle, salePrice: number): number {
  if (salePrice <= 0) return 0
  return margin(vehicle, salePrice) / salePrice
}

/** A maior faixa de `commissionTiers` que couber na margem. */
export function commissionRate(marginValue: number, rules: Rules): number {
  let rate = 0
  for (const [min, pct] of rules.commissionTiers) {
    if (marginValue >= min) rate = pct
  }
  return rate
}

/** Comissão do vendedor: fatia da margem, pela faixa alcançada. */
export function commission(marginValue: number, rules: Rules): number {
  if (marginValue <= 0) return 0
  return Math.round(marginValue * commissionRate(marginValue, rules))
}

/** Desconto sugerido cresce por faixa de idade do estoque. */
export function suggestedDiscountPct(days: number, rules: Rules): number {
  const over = days - rules.slowStockDays
  if (over <= 0) return 0
  if (over < 30) return 0.03
  if (over < 60) return 0.05
  if (over < 90) return 0.08
  return 0.12
}

/** Disponíveis parados há mais que `slowStockDays`, do mais parado ao menos. */
export function slowMovers(vehicles: Vehicle[], at: number, rules: Rules): SlowMover[] {
  return vehicles
    .filter((v) => v.state === 'disponivel' && daysInStock(v, at) > rules.slowStockDays)
    .map((vehicle) => {
      const days = daysInStock(vehicle, at)
      const pct = suggestedDiscountPct(days, rules)
      return {
        vehicle,
        days,
        suggestedDiscountPct: pct,
        suggestedPrice: Math.round((vehicle.price * (1 - pct)) / 100) * 100,
      }
    })
    .sort((a, b) => b.days - a.days)
}

// ===========================================================================
// Propostas
// ===========================================================================

export const STAGES: DealStage[] = ['contato', 'proposta', 'negociacao', 'aprovada', 'perdida']

/** Preço fechado da proposta: vitrine menos o desconto concedido. */
export function dealPrice(deal: Deal, vehicle: Vehicle | undefined): number {
  if (!vehicle) return 0
  return Math.max(0, vehicle.price - deal.discount)
}

export function dealsOfStage(deals: Deal[], stage: DealStage): Deal[] {
  return deals.filter((d) => d.stage === stage).sort((a, b) => b.movedAt.localeCompare(a.movedAt))
}

export function dealsOfVehicle(deals: Deal[], vehicleId: number): Deal[] {
  return deals.filter((d) => d.vehicleId === vehicleId).sort((a, b) => b.movedAt.localeCompare(a.movedAt))
}

export function dealsOfCustomer(deals: Deal[], customerId: number): Deal[] {
  return deals.filter((d) => d.customerId === customerId).sort((a, b) => b.movedAt.localeCompare(a.movedAt))
}

export function tradeInsOfCustomer(tradeIns: TradeIn[], customerId: number): TradeIn[] {
  return tradeIns.filter((t) => t.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Conta e soma valor por etapa, dentro da janela pedida. */
export function funnel(deals: Deal[], vehicles: Vehicle[], rangeDays: number, at: number): FunnelRow[] {
  const from = at - rangeDays * DAY
  return STAGES.map((stage) => {
    const rows = deals.filter((d) => d.stage === stage && new Date(d.createdAt).getTime() >= from)
    return {
      stage,
      count: rows.length,
      value: rows.reduce((sum, d) => sum + dealPrice(d, vehicleById(vehicles, d.vehicleId)), 0),
    }
  })
}

// ===========================================================================
// Indicadores da visão geral
// ===========================================================================

const dayLabel = (ms: number) => {
  const d = new Date(ms)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Faturamento por dia dos últimos `days` dias — a série do gráfico. */
export function salesByDay(vehicles: Vehicle[], days: number, at: number): SeriesPoint[] {
  const buckets = new Map<string, number>()
  const start = new Date(at)
  start.setHours(0, 0, 0, 0)
  const startMs = start.getTime() - (days - 1) * DAY

  for (let i = 0; i < days; i++) buckets.set(dayLabel(startMs + i * DAY), 0)

  for (const v of vehicles) {
    if (v.state !== 'vendido' || !v.soldAt) continue
    const ms = new Date(v.soldAt).getTime()
    if (ms < startMs || ms > at + DAY) continue
    const key = dayLabel(ms)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + v.price)
  }

  return Array.from(buckets, ([label, value]) => ({ label, value }))
}

export function soldInRange(vehicles: Vehicle[], days: number, at: number): Vehicle[] {
  const from = at - days * DAY
  return vehicles.filter((v) => v.state === 'vendido' && v.soldAt && new Date(v.soldAt).getTime() >= from)
}

export interface StockKpis {
  sales: number
  revenue: number
  avgTicket: number
  totalMargin: number
  avgDays: number
  available: number
  reserved: number
  stockValue: number
  slow: number
}

export function stockKpis(vehicles: Vehicle[], at: number, rules: Rules): StockKpis {
  const sold = soldInRange(vehicles, 30, at)
  const revenue = sold.reduce((sum, v) => sum + v.price, 0)
  const totalMargin = sold.reduce((sum, v) => sum + margin(v, v.price), 0)
  const inStock = vehicles.filter((v) => v.state === 'disponivel' || v.state === 'preparacao')
  const avgDays = inStock.length
    ? Math.round(inStock.reduce((sum, v) => sum + daysInStock(v, at), 0) / inStock.length)
    : 0

  return {
    sales: sold.length,
    revenue,
    avgTicket: sold.length ? Math.round(revenue / sold.length) : 0,
    totalMargin,
    avgDays,
    available: vehicles.filter((v) => v.state === 'disponivel').length,
    reserved: vehicles.filter((v) => v.state === 'reservado').length,
    stockValue: inStock.reduce((sum, v) => sum + v.price, 0),
    slow: slowMovers(vehicles, at, rules).length,
  }
}

/** Metas, vendas, margem e comissão de cada vendedor no mês corrente. */
export function sellerPerformance(
  sellers: Seller[],
  deals: Deal[],
  vehicles: Vehicle[],
  at: number,
  rules: Rules
): SellerPerformance[] {
  const from = at - 30 * DAY
  return sellers
    .map((seller) => {
      const won = deals.filter(
        (d) => d.sellerId === seller.id && d.stage === 'aprovada' && new Date(d.movedAt).getTime() >= from
      )
      let revenue = 0
      let marginSum = 0
      let commissionSum = 0
      for (const deal of won) {
        const vehicle = vehicleById(vehicles, deal.vehicleId)
        if (!vehicle) continue
        const price = dealPrice(deal, vehicle)
        const m = margin(vehicle, price)
        revenue += price
        marginSum += m
        commissionSum += commission(m, rules)
      }
      return {
        seller,
        sales: won.length,
        revenue,
        margin: marginSum,
        commission: commissionSum,
        goal: seller.monthlyGoal,
        goalPct: seller.monthlyGoal ? won.length / seller.monthlyGoal : 0,
      }
    })
    .sort((a, b) => b.sales - a.sales || b.margin - a.margin)
}

// ===========================================================================
// Vitrine: filtros, busca e ordenação
// ===========================================================================

export interface StockFilters {
  term?: string
  brandId?: number | null
  modelId?: number | null
  category?: string
  transmission?: string
  fuel?: string
  color?: string
  yearMin?: number | null
  priceMax?: number | null
  kmMax?: number | null
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function filterStock(
  vehicles: Vehicle[],
  models: Model[],
  brands: Brand[],
  filters: StockFilters
): Vehicle[] {
  const term = filters.term ? normalize(filters.term.trim()) : ''
  return vehicles.filter((v) => {
    const model = modelById(models, v.modelId)
    if (!model) return false
    if (filters.brandId && model.brandId !== filters.brandId) return false
    if (filters.modelId && model.id !== filters.modelId) return false
    if (filters.category && model.category !== filters.category) return false
    if (filters.transmission && v.transmission !== filters.transmission) return false
    if (filters.fuel && v.fuel !== filters.fuel) return false
    if (filters.color && v.color !== filters.color) return false
    if (filters.yearMin && v.modelYear < filters.yearMin) return false
    if (filters.priceMax && v.price > filters.priceMax) return false
    if (filters.kmMax != null && v.km > filters.kmMax) return false
    if (term) {
      const haystack = normalize(`${vehicleLabel(models, brands, v)} ${v.color} ${v.modelYear}`)
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

export function sortStock(vehicles: Vehicle[], sort: StockSort): Vehicle[] {
  const list = [...vehicles]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'km-asc':
      return list.sort((a, b) => a.km - b.km)
    case 'year-desc':
      return list.sort((a, b) => b.modelYear - a.modelYear || a.km - b.km)
    default:
      return list.sort((a, b) => b.arrivedAt.localeCompare(a.arrivedAt))
  }
}

/** Chegaram por último e ainda estão disponíveis. */
export function freshArrivals(vehicles: Vehicle[], limit = 8): Vehicle[] {
  return sortStock(availableStock(vehicles), 'recent').slice(0, limit)
}

/** Destaques da semana: melhor relação preço/ano entre os disponíveis. */
export function weeklyHighlights(vehicles: Vehicle[], limit = 4): Vehicle[] {
  return [...availableStock(vehicles)]
    .sort((a, b) => b.modelYear - a.modelYear || a.km - b.km)
    .slice(0, limit)
}

/** Mesmo segmento, faixa de preço parecida, sem repetir o próprio veículo. */
export function similarVehicles(vehicles: Vehicle[], models: Model[], vehicle: Vehicle, limit = 4): Vehicle[] {
  const model = modelById(models, vehicle.modelId)
  return availableStock(vehicles)
    .filter((v) => v.id !== vehicle.id && modelById(models, v.modelId)?.category === model?.category)
    .sort((a, b) => Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price))
    .slice(0, limit)
}

export function countByCategory(vehicles: Vehicle[], models: Model[], category: string): number {
  return vehicles.filter((v) => modelById(models, v.modelId)?.category === category).length
}
