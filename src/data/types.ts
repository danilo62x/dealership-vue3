// ---------------------------------------------------------------------------
// Domínio da concessionária. Tudo em pt-BR, marcas e modelos fictícios.
// ---------------------------------------------------------------------------

export type Transmission = 'manual' | 'automatico' | 'cvt' | 'automatizado'
export type Fuel = 'flex' | 'gasolina' | 'diesel' | 'hibrido' | 'eletrico'
export type StockState = 'disponivel' | 'reservado' | 'vendido' | 'preparacao'
export type DealStage = 'contato' | 'proposta' | 'negociacao' | 'aprovada' | 'perdida'
export type Condition = 'excelente' | 'bom' | 'regular' | 'ruim'
export type DriveStatus = 'agendado' | 'realizado' | 'cancelado' | 'faltou'
export type ModelCategory = 'hatch' | 'sedan' | 'suv' | 'picape' | 'utilitario'

export interface Brand {
  id: number
  slug: string
  name: string
  /** Semente da marca-d'água usada no card — não é uma imagem gravada. */
  logoSeed: string
}

export interface Model {
  id: number
  brandId: number
  slug: string
  name: string
  category: ModelCategory
  /** Valor de referência do modelo 0 km, base da tabela de troca. */
  referenceNew: number
}

export interface Vehicle {
  id: number
  slug: string
  modelId: number
  version: string
  year: number
  modelYear: number
  km: number
  color: string
  plateEnd: string
  transmission: Transmission
  fuel: Fuel
  doors: number
  options: string[]
  photoSeeds: string[]
  /** Custos internos — só a área logada vê. */
  acquisitionCost: number
  prepCost: number
  price: number
  state: StockState
  arrivedAt: string
  soldAt: string | null
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  document: string
  avatar: string
  /** Validade da CNH. `null` = cliente nunca informou a habilitação. */
  cnhUntil: string | null
  createdAt: string
}

export interface Seller {
  id: number
  name: string
  email: string
  avatar: string
  since: string
  monthlyGoal: number
}

export interface DealFinance {
  down: number
  months: number
  monthlyRate: number
}

export interface Deal {
  id: number
  vehicleId: number
  customerId: number
  sellerId: number
  stage: DealStage
  createdAt: string
  movedAt: string
  discount: number
  tradeInId: number | null
  finance: DealFinance | null
  lostReason?: string
}

export interface TradeIn {
  id: number
  dealId: number | null
  customerId: number
  modelId: number
  year: number
  km: number
  condition: Condition
  options: string[]
  accepted: boolean
  createdAt: string
}

export interface TestDrive {
  id: number
  vehicleId: number
  customerId: number
  sellerId: number
  /** Dia no formato `YYYY-MM-DD`. */
  date: string
  /** Hora local `HH:mm`. */
  from: string
  to: string
  status: DriveStatus
  cnhOk: boolean
}

export interface Rules {
  /** Taxa mensal padrão do financiamento, ex.: 0.0189 = 1,89% a.m. */
  defaultMonthlyRate: number
  /** Entrada mínima como fração do preço, ex.: 0.20. */
  minDownPct: number
  /** Tarifa de cadastro somada ao CET. */
  registrationFee: number
  /** IOF aproximado ao ano, aplicado sobre o valor financiado. */
  iocPct: number
  /** A partir de quantos dias parados o veículo entra no giro lento. */
  slowStockDays: number
  /** Comissão por faixa de margem: [margemMin, fatia da margem]. */
  commissionTiers: [number, number][]
  /** Depreciação anual do valor de referência, ex.: 0.11. */
  depreciationPerYear: number
  /** Quilometragem de referência por ano de uso. */
  kmPerYearRef: number
  /** R$ por 1.000 km acima/abaixo da referência. */
  kmAdjustPer1000: number
  /** Ajuste percentual por estado de conservação. */
  conditionAdjust: Record<Condition, number>
  /** Quanto cada opcional valorizado soma na troca. */
  optionValue: Record<string, number>
}

// ---- Formas derivadas (nunca gravadas) -----------------------------------

/** Uma linha da memória do cálculo do financiamento. */
export interface FinanceStep {
  /** Chave i18n do rótulo, sob `finance.memo.*`. */
  key: string
  /** A fórmula, já com os números substituídos. */
  formula: string
  /** O resultado da linha, formatado pela página. */
  value: number
  /** `money` imprime em R$, `rate` em %, `plain` cru. */
  kind: 'money' | 'rate' | 'plain'
}

export interface Simulation {
  price: number
  down: number
  months: number
  monthlyRate: number
  financed: number
  installment: number
  total: number
  interest: number
  fees: number
  iof: number
  /** Custo Efetivo Total anual, aproximado. */
  cet: number
  steps: FinanceStep[]
}

/** Um ajuste da avaliação de troca, sempre em R$ (positivo ou negativo). */
export interface Adjustment {
  /** Chave i18n sob `appraisal.adj.*`. */
  key: string
  /** Detalhe já formatado (ex.: "8 anos", "24.000 km acima"). */
  detail: string
  amount: number
}

export interface Appraisal {
  reference: number
  value: number
  low: number
  high: number
  adjustments: Adjustment[]
}

export interface DriveConflict {
  vehicle?: TestDrive
  seller?: TestDrive
}

export interface FunnelRow {
  stage: DealStage
  count: number
  value: number
}

export interface SeriesPoint {
  label: string
  value: number
}

export interface SlowMover {
  vehicle: Vehicle
  days: number
  /** Fração sugerida de desconto, derivada da idade do estoque. */
  suggestedDiscountPct: number
  suggestedPrice: number
}

export interface SellerPerformance {
  seller: Seller
  sales: number
  revenue: number
  margin: number
  commission: number
  goal: number
  goalPct: number
}

export type StockSort = 'recent' | 'price-asc' | 'price-desc' | 'km-asc' | 'year-desc'
