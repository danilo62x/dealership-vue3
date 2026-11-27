import type {
  Brand,
  Condition,
  Customer,
  Deal,
  DealStage,
  Fuel,
  Model,
  Rules,
  Seller,
  StockState,
  TestDrive,
  TradeIn,
  Transmission,
  Vehicle,
} from './types'

// ---------------------------------------------------------------------------
// Fotos: conjuntos Unsplash curados e ja verificados no monorepo.
// Nada de picsum — as fotos precisam ter relacao com o vertical.
// ---------------------------------------------------------------------------

const IMG: Record<string, string[]> = {
  car: [
    '1558618666-fcd25c85cd64',
    '1619642751034-765dfdf7c58e',
    '1487754180451-c456f719a1fc',
    '1503376780353-7e6692767b70',
    '1530046339160-ce3e530c7d2f',
    '1492144534655-ae79c964c9d7',
    '1625047509168-a7026f36de04',
    '1614026480209-cd9934144671',
    '1517524008697-84bbe3c3fd98',
    '1615906655593-ad0386982a0f',
  ],
  city: ['1477959858617-67f85cf4f1df', '1496568816309-51d7c20e3b21', '1480714378408-67cf0d13bc1b'],
  people: [
    '1500648767791-00dcc994a43e',
    '1494790108377-be9c29b29330',
    '1507003211169-0a1dd7228f2d',
    '1438761681033-6461ffad8d80',
    '1633332755192-727a05c4013d',
    '1573496359142-b8d87734a5a2',
  ],
}

function imgHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function imgCategory(seed: string): string {
  const s = seed.toLowerCase()
  if (/avatar|cliente|comprador|people|person|profile|user|vendedor/.test(s)) return 'people'
  if (/bairro|city|fachada|loja|location|showroom|unidade/.test(s)) return 'city'
  return 'car'
}

function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`
}

/** URL deterministica por semente — fotos de veiculo, capas e avatares. */
export function dlImage(seed: string, w = 960, h = 640): string {
  const ids = IMG[imgCategory(seed)]
  return unsplash(ids[imgHash('dl-' + seed) % ids.length], w, h)
}

const av = (seed: string) => unsplash(IMG.people[imgHash('dl-av-' + seed) % IMG.people.length], 120, 120)

// ---------------------------------------------------------------------------
// Gerador deterministico. A mesma semente devolve sempre o mesmo estoque.
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// "Agora" e resolvido UMA vez, aqui. Todas as datas do estoque nascem dele e o
// dia e ancorado a meia-noite: assim os dias em estoque nao mudam a cada F5.
// ---------------------------------------------------------------------------

const ANCHOR = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
})()

const DAY = 86_400_000
const CURRENT_YEAR = new Date(ANCHOR).getFullYear()

const pad2 = (n: number) => String(n).padStart(2, '0')

/** ISO de um dia relativo a hoje, com hora cheia. */
function dayAt(offsetDays: number, hour = 10): string {
  const d = new Date(ANCHOR + offsetDays * DAY)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

/** Chave `YYYY-MM-DD` de um dia relativo a hoje — o formato da agenda. */
export function dayKey(offsetDays: number): string {
  const d = new Date(ANCHOR + offsetDays * DAY)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** O "hoje" da semente, para a agenda abrir no dia certo. */
export const TODAY_KEY = dayKey(0)

// ---------------------------------------------------------------------------
// Regras da loja
// ---------------------------------------------------------------------------

export const OPTION_CATALOG = [
  'Ar-condicionado',
  'Direção elétrica',
  'Central multimídia',
  'Câmera de ré',
  'Sensor de estacionamento',
  'Piloto automático',
  'Faróis de LED',
  'Rodas de liga leve',
  'Bancos de couro',
  'Teto solar',
  'Chave presencial',
  'Controle de estabilidade',
  'Engate reboque',
  'Blindagem',
]

export const RULES: Rules = {
  defaultMonthlyRate: 0.0189,
  minDownPct: 0.2,
  registrationFee: 890,
  iocPct: 0.0338,
  slowStockDays: 60,
  // [margem minima em R$, fatia da margem que vai para o vendedor]
  commissionTiers: [
    [0, 0.1],
    [4000, 0.15],
    [9000, 0.2],
    [16000, 0.28],
  ],
  depreciationPerYear: 0.11,
  kmPerYearRef: 12000,
  kmAdjustPer1000: 420,
  conditionAdjust: { excelente: 0.05, bom: 0, regular: -0.07, ruim: -0.16 },
  optionValue: {
    'Ar-condicionado': 900,
    'Direção elétrica': 700,
    'Central multimídia': 1400,
    'Câmera de ré': 900,
    'Sensor de estacionamento': 700,
    'Piloto automático': 800,
    'Faróis de LED': 1100,
    'Rodas de liga leve': 1200,
    'Bancos de couro': 1800,
    'Teto solar': 3200,
    'Chave presencial': 900,
    'Controle de estabilidade': 600,
    'Engate reboque': 500,
    Blindagem: 12000,
  },
}

// ---------------------------------------------------------------------------
// Marcas e modelos — todos FICTICIOS.
// ---------------------------------------------------------------------------

export const BRANDS: Brand[] = [
  { id: 1, slug: 'aurex', name: 'Aurex', logoSeed: 'aurex-marca' },
  { id: 2, slug: 'bravano', name: 'Bravano', logoSeed: 'bravano-marca' },
  { id: 3, slug: 'corvell', name: 'Corvell', logoSeed: 'corvell-marca' },
  { id: 4, slug: 'delvara', name: 'Delvara', logoSeed: 'delvara-marca' },
  { id: 5, slug: 'ferun', name: 'Ferun', logoSeed: 'ferun-marca' },
  { id: 6, slug: 'kastor', name: 'Kastor', logoSeed: 'kastor-marca' },
  { id: 7, slug: 'miraldo', name: 'Miraldo', logoSeed: 'miraldo-marca' },
  { id: 8, slug: 'norvent', name: 'Norvent', logoSeed: 'norvent-marca' },
  { id: 9, slug: 'solvia', name: 'Solvia', logoSeed: 'solvia-marca' },
  { id: 10, slug: 'trevani', name: 'Trevani', logoSeed: 'trevani-marca' },
]

type ModelSeed = [brandId: number, name: string, category: Model['category'], referenceNew: number]

const MODEL_SEEDS: ModelSeed[] = [
  [1, 'Lumia', 'hatch', 89900],
  [1, 'Vento', 'sedan', 118500],
  [1, 'Serra', 'suv', 164900],
  [1, 'Carga', 'utilitario', 142000],
  [2, 'Pixel', 'hatch', 82400],
  [2, 'Onda', 'sedan', 124900],
  [2, 'Cume', 'suv', 189900],
  [3, 'Ágil', 'hatch', 78900],
  [3, 'Brisa', 'sedan', 132000],
  [3, 'Rocha', 'picape', 214900],
  [3, 'Duna', 'suv', 176500],
  [4, 'Nix', 'hatch', 95700],
  [4, 'Aria', 'sedan', 145300],
  [4, 'Titan', 'picape', 239900],
  [5, 'Trilha', 'suv', 158900],
  [5, 'Metro', 'hatch', 74300],
  [5, 'Furgo', 'utilitario', 168400],
  [6, 'Forte', 'picape', 226700],
  [6, 'Aço', 'utilitario', 152900],
  [6, 'Urbano', 'hatch', 86200],
  [7, 'Prata', 'sedan', 139900],
  [7, 'Nuvem', 'suv', 198400],
  [7, 'Vivo', 'hatch', 91100],
  [8, 'Elo', 'hatch', 172900],
  [8, 'Fluxo', 'sedan', 209700],
  [8, 'Volt', 'suv', 259900],
  [9, 'Sol', 'hatch', 79900],
  [9, 'Costa', 'sedan', 128600],
  [9, 'Monte', 'suv', 183200],
  [9, 'Campo', 'picape', 205400],
  [10, 'Lince', 'suv', 171800],
  [10, 'Corso', 'sedan', 149500],
  [10, 'Faixa', 'hatch', 88700],
  [10, 'Bloco', 'utilitario', 159900],
]

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const MODELS: Model[] = MODEL_SEEDS.map(([brandId, name, category, referenceNew], i) => ({
  id: i + 1,
  brandId,
  slug: `${BRANDS[brandId - 1].slug}-${slugify(name)}`,
  name,
  category,
  referenceNew,
}))

// ---------------------------------------------------------------------------
// Vendedores
// ---------------------------------------------------------------------------

export const SELLERS: Seller[] = [
  {
    id: 1,
    name: 'Marcelo Tavares',
    email: 'marcelo.tavares@garagem.com.br',
    avatar: av('vendedor-marcelo'),
    since: dayAt(-1420),
    monthlyGoal: 8,
  },
  {
    id: 2,
    name: 'Renata Bulhões',
    email: 'renata.bulhoes@garagem.com.br',
    avatar: av('vendedor-renata'),
    since: dayAt(-1180),
    monthlyGoal: 9,
  },
  {
    id: 3,
    name: 'Aline Cordeiro',
    email: 'aline.cordeiro@garagem.com.br',
    avatar: av('vendedor-aline'),
    since: dayAt(-860),
    monthlyGoal: 7,
  },
  {
    id: 4,
    name: 'Vinícius Prado',
    email: 'vinicius.prado@garagem.com.br',
    avatar: av('vendedor-vinicius'),
    since: dayAt(-640),
    monthlyGoal: 6,
  },
  {
    id: 5,
    name: 'Tarso Meireles',
    email: 'tarso.meireles@garagem.com.br',
    avatar: av('vendedor-tarso'),
    since: dayAt(-410),
    monthlyGoal: 6,
  },
  {
    id: 6,
    name: 'Juliana Sampaio',
    email: 'juliana.sampaio@garagem.com.br',
    avatar: av('vendedor-juliana'),
    since: dayAt(-205),
    monthlyGoal: 5,
  },
]

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Adriana',
  'Bruno',
  'Camila',
  'Diego',
  'Elaine',
  'Fábio',
  'Gisele',
  'Henrique',
  'Isabela',
  'João',
  'Karina',
  'Leonardo',
  'Marina',
  'Nelson',
  'Otávio',
  'Patrícia',
  'Rafael',
  'Sabrina',
  'Thiago',
  'Vanessa',
  'Wagner',
  'Yara',
  'Alexandre',
  'Beatriz',
  'Cristiano',
  'Débora',
  'Eduardo',
  'Fernanda',
  'Gustavo',
  'Helena',
]

const LAST_NAMES = [
  'Almeida',
  'Barreto',
  'Camargo',
  'Dutra',
  'Esteves',
  'Fontoura',
  'Guimarães',
  'Hirano',
  'Iglesias',
  'Junqueira',
  'Kowalski',
  'Lacerda',
  'Machado',
  'Nogueira',
  'Oliveira',
  'Peixoto',
  'Quirino',
  'Rezende',
  'Salgado',
  'Teixeira',
  'Uchôa',
  'Valente',
  'Wanderley',
  'Xavier',
  'Zamora',
  'Bettencourt',
  'Coutinho',
  'Delgado',
  'Ferraz',
  'Gaspar',
]

const DDDS = [11, 11, 11, 12, 13, 15, 16, 19, 21, 31, 41, 47, 51, 62, 71, 81]

/** Indices dos 3 clientes com CNH vencida — o agendamento precisa recusar. */
const EXPIRED_CNH_CUSTOMERS = [4, 57, 118]
/** Indices dos clientes que nunca informaram a CNH. */
const NO_CNH_CUSTOMERS = [22, 73, 131]
/** O cliente 1 e o visitante da demonstracao no site publico. */
export const VISITOR_CUSTOMER_ID = 1

function buildCustomers(rnd: () => number): Customer[] {
  const list: Customer[] = []
  for (let i = 0; i < 140; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[(Math.floor(i / FIRST_NAMES.length) * 7 + (i % 7)) % LAST_NAMES.length]
    const name = `${first} ${last}`
    const ddd = DDDS[Math.floor(rnd() * DDDS.length)]

    let cnhUntil: string | null
    if (NO_CNH_CUSTOMERS.includes(i)) cnhUntil = null
    else if (EXPIRED_CNH_CUSTOMERS.includes(i)) cnhUntil = dayAt(-(30 + Math.floor(rnd() * 300)))
    else cnhUntil = dayAt(90 + Math.floor(rnd() * 1400))

    list.push({
      id: i + 1,
      name,
      email: `${slugify(first)}.${slugify(last)}${i}@exemplo.com`,
      phone: `(${ddd}) 9${1000 + Math.floor(rnd() * 8999)}-${1000 + Math.floor(rnd() * 8999)}`,
      document: `${100 + Math.floor(rnd() * 899)}.***.***-${pad2(Math.floor(rnd() * 100))}`,
      avatar: av(`cliente-${i}`),
      cnhUntil,
      createdAt: dayAt(-(20 + Math.floor(rnd() * 900))),
    })
  }
  return list
}

// ---------------------------------------------------------------------------
// Estoque — 96 veiculos nos 4 estados
// ---------------------------------------------------------------------------

const COLORS = ['Branco', 'Prata', 'Preto', 'Cinza', 'Vermelho', 'Azul', 'Verde-oliva', 'Bege']

const VERSIONS: Record<Model['category'], string[]> = {
  hatch: ['1.0 Turbo', '1.0 Vibe', '1.6 Comfort', '1.6 Sport'],
  sedan: ['1.6 Comfort', '2.0 Exclusive', '1.4 Turbo Prime', '2.0 Elegance'],
  suv: ['1.5 Turbo Nav', '2.0 AWD Prime', '1.8 Comfort', '2.0 Signature'],
  picape: ['2.8 4x4 Rally', '2.2 4x2 Work', '3.0 4x4 Peak', '2.4 Cabine Dupla'],
  utilitario: ['1.8 Furgão', '2.0 Chassi', '1.6 Carga Longa', '2.3 Baú'],
}

const TRANSMISSIONS: Transmission[] = ['manual', 'automatico', 'cvt', 'automatizado']

/** Veiculos parados ha mais de 60 dias — a lista de giro lento tem 12 nomes. */
const SLOW_STOCK = new Set([0, 6, 11, 18, 27, 35, 42, 49, 55, 64, 78, 87])
const RESERVED_STOCK = new Set([3, 14, 22, 31, 45, 52, 60, 71, 83, 91])
const SOLD_STOCK = new Set([1, 7, 12, 19, 26, 33, 39, 44, 50, 57, 63, 68, 74, 79, 85, 88, 92, 95])
const PREP_STOCK = new Set([5, 24, 41, 58, 76, 90])
/** Veiculos comprados no prejuizo — a margem prevista fica negativa. */
const LOSS_STOCK = new Set([9, 21, 38, 61, 82])

/**
 * O veiculo 1 e o que voltou de uma proposta perdida: segue disponivel e o
 * contador de dias em estoque nunca zerou. E o caso de teste da regra 4.
 */
const RETURNED_VEHICLE_INDEX = 0

function stateOf(i: number): StockState {
  if (RESERVED_STOCK.has(i)) return 'reservado'
  if (SOLD_STOCK.has(i)) return 'vendido'
  if (PREP_STOCK.has(i)) return 'preparacao'
  return 'disponivel'
}

function fuelFor(model: Model, rnd: () => number): Fuel {
  if (model.name === 'Elo' || model.name === 'Volt') return 'eletrico'
  if (model.name === 'Fluxo') return 'hibrido'
  if (model.category === 'picape' || model.category === 'utilitario') return rnd() < 0.7 ? 'diesel' : 'flex'
  return rnd() < 0.82 ? 'flex' : 'gasolina'
}

function buildVehicles(rnd: () => number): Vehicle[] {
  const list: Vehicle[] = []

  for (let i = 0; i < 96; i++) {
    const model = MODELS[Math.floor(rnd() * MODELS.length)]
    const brand = BRANDS[model.brandId - 1]
    const age = SLOW_STOCK.has(i) ? 3 + Math.floor(rnd() * 6) : Math.floor(rnd() * 9)
    const year = CURRENT_YEAR - age
    const modelYear = age > 0 && rnd() < 0.45 ? year + 1 : year

    const kmSpread = 0.55 + rnd() * 0.95
    const km =
      age === 0
        ? Math.round((rnd() * 9000) / 100) * 100
        : Math.round((age * RULES.kmPerYearRef * kmSpread) / 100) * 100

    // Preco de vitrine: referencia 0 km depreciada pela idade e pela rodagem.
    const byAge = model.referenceNew * Math.pow(1 - RULES.depreciationPerYear, age)
    const expectedKm = Math.max(age, 1) * RULES.kmPerYearRef
    const kmPenalty = ((km - expectedKm) / 1000) * RULES.kmAdjustPer1000 * 0.5
    const price = Math.max(28000, Math.round((byAge - kmPenalty) / 100) * 100)

    const prepCost = Math.round((600 + rnd() * 4200) / 50) * 50
    const marginPct = LOSS_STOCK.has(i) ? -(0.005 + rnd() * 0.04) : 0.06 + rnd() * 0.08
    const acquisitionCost = Math.round((price * (1 - marginPct) - prepCost) / 50) * 50

    const version = VERSIONS[model.category][Math.floor(rnd() * VERSIONS[model.category].length)]
    const fuel = fuelFor(model, rnd)
    const transmission: Transmission =
      fuel === 'eletrico' ? 'automatico' : TRANSMISSIONS[Math.floor(rnd() * TRANSMISSIONS.length)]

    const optionCount = 3 + Math.floor(rnd() * 6)
    const options: string[] = []
    for (let k = 0; k < optionCount; k++) {
      const opt = OPTION_CATALOG[Math.floor(rnd() * OPTION_CATALOG.length)]
      if (!options.includes(opt)) options.push(opt)
    }

    const state = stateOf(i)
    let arrivedOffset: number
    if (SLOW_STOCK.has(i)) arrivedOffset = -(64 + Math.floor(rnd() * 118))
    else if (state === 'vendido') arrivedOffset = -(35 + Math.floor(rnd() * 115))
    else arrivedOffset = -(3 + Math.floor(rnd() * 55))

    const soldAt =
      state === 'vendido'
        ? dayAt(Math.min(-1, arrivedOffset + 7 + Math.floor(rnd() * Math.max(1, -arrivedOffset - 10))), 16)
        : null

    const slug = `${brand.slug}-${slugify(model.name)}-${slugify(version)}-${modelYear}-${i + 1}`

    list.push({
      id: i + 1,
      slug,
      modelId: model.id,
      version,
      year,
      modelYear,
      km,
      color: COLORS[Math.floor(rnd() * COLORS.length)],
      plateEnd: String(Math.floor(rnd() * 10)),
      transmission,
      fuel,
      doors: model.category === 'picape' ? (rnd() < 0.75 ? 4 : 2) : rnd() < 0.9 ? 4 : 2,
      options,
      photoSeeds: [`${slug}-a`, `${slug}-b`, `${slug}-c`, `${slug}-d`],
      acquisitionCost,
      prepCost,
      price,
      state,
      arrivedAt: dayAt(arrivedOffset, 9),
      soldAt,
    })
  }

  return list
}

// ---------------------------------------------------------------------------
// Propostas — 180 espalhadas por 90 dias nas 5 etapas
// ---------------------------------------------------------------------------

const LOST_REASONS = [
  'Comprou em outra loja',
  'Crédito recusado',
  'Não fechou o valor da troca',
  'Desistiu da compra',
  'Prazo de entrega',
]

function buildDeals(rnd: () => number, vehicles: Vehicle[], customers: Customer[]): Deal[] {
  const deals: Deal[] = []
  let id = 1

  const monthsOptions = [24, 36, 48, 60]
  const pickCustomer = () => customers[Math.floor(rnd() * customers.length)]
  const pickSeller = () => SELLERS[Math.floor(rnd() * SELLERS.length)]

  const makeDeal = (vehicle: Vehicle, stage: DealStage, createdOffset: number, movedOffset: number): Deal => {
    const customer = pickCustomer()
    const seller = pickSeller()
    const withFinance = rnd() < 0.72
    const discount = stage === 'contato' ? 0 : Math.round((rnd() * 0.045 * vehicle.price) / 100) * 100
    return {
      id: id++,
      vehicleId: vehicle.id,
      customerId: customer.id,
      sellerId: seller.id,
      stage,
      createdAt: dayAt(createdOffset, 11),
      movedAt: dayAt(movedOffset, 15),
      discount,
      tradeInId: null,
      finance: withFinance
        ? {
            down: Math.round((vehicle.price * (RULES.minDownPct + rnd() * 0.25)) / 100) * 100,
            months: monthsOptions[Math.floor(rnd() * monthsOptions.length)],
            monthlyRate: Number((RULES.defaultMonthlyRate + (rnd() - 0.5) * 0.004).toFixed(4)),
          }
        : null,
    }
  }

  // 1) Toda venda e toda reserva nasceram de uma proposta aprovada.
  const approvedVehicles = vehicles.filter((v) => v.state === 'vendido' || v.state === 'reservado')
  for (const vehicle of approvedVehicles) {
    const soldOffset = vehicle.soldAt
      ? Math.round((new Date(vehicle.soldAt).getTime() - ANCHOR) / DAY)
      : -(1 + Math.floor(rnd() * 12))
    const created = Math.min(-2, soldOffset - (5 + Math.floor(rnd() * 20)))
    deals.push(makeDeal(vehicle, 'aprovada', created, soldOffset))
  }

  // 2) A proposta perdida cujo veiculo VOLTOU para a vitrine. O contador de
  //    dias em estoque continua de onde parou — nada zera aqui.
  const returned = vehicles[RETURNED_VEHICLE_INDEX]
  const returnedDeal = makeDeal(returned, 'perdida', -52, -19)
  returnedDeal.lostReason = 'Crédito recusado'
  deals.push(returnedDeal)

  // 3) O resto do funil, sobre veiculos que seguem na vitrine.
  const openStock = vehicles.filter((v) => v.state === 'disponivel' || v.state === 'preparacao')
  const plan: [DealStage, number][] = [
    ['contato', 44],
    ['proposta', 42],
    ['negociacao', 34],
    ['perdida', 31],
  ]
  for (const [stage, count] of plan) {
    for (let k = 0; k < count; k++) {
      const vehicle = openStock[Math.floor(rnd() * openStock.length)]
      const created = -(2 + Math.floor(rnd() * 88))
      const moved = Math.min(-1, created + Math.floor(rnd() * 12))
      const deal = makeDeal(vehicle, stage, created, moved)
      if (stage === 'perdida') deal.lostReason = LOST_REASONS[Math.floor(rnd() * LOST_REASONS.length)]
      deals.push(deal)
    }
  }

  return deals
}

// ---------------------------------------------------------------------------
// Avaliacoes de troca — ~50, algumas ligadas a propostas
// ---------------------------------------------------------------------------

const CONDITIONS: Condition[] = ['excelente', 'bom', 'bom', 'regular', 'ruim']

function buildTradeIns(rnd: () => number, deals: Deal[], customers: Customer[]): TradeIn[] {
  const list: TradeIn[] = []
  const linkable = deals.filter((d) => d.stage !== 'contato')
  let id = 1

  for (let i = 0; i < 52; i++) {
    const linked = i < 34 ? linkable[Math.floor(rnd() * linkable.length)] : null
    const customerId = linked ? linked.customerId : customers[Math.floor(rnd() * customers.length)].id
    const model = MODELS[Math.floor(rnd() * MODELS.length)]
    const age = 2 + Math.floor(rnd() * 10)
    const year = CURRENT_YEAR - age
    const km = Math.round((age * RULES.kmPerYearRef * (0.5 + rnd() * 1.1)) / 500) * 500

    const optionCount = 1 + Math.floor(rnd() * 4)
    const options: string[] = []
    for (let k = 0; k < optionCount; k++) {
      const opt = OPTION_CATALOG[Math.floor(rnd() * OPTION_CATALOG.length)]
      if (!options.includes(opt)) options.push(opt)
    }

    const tradeIn: TradeIn = {
      id: id++,
      dealId: linked ? linked.id : null,
      customerId,
      modelId: model.id,
      year,
      km,
      condition: CONDITIONS[Math.floor(rnd() * CONDITIONS.length)],
      options,
      accepted: linked ? linked.stage === 'aprovada' || rnd() < 0.5 : rnd() < 0.3,
      createdAt: dayAt(-(1 + Math.floor(rnd() * 89)), 14),
    }
    list.push(tradeIn)
    if (linked && linked.tradeInId === null) linked.tradeInId = tradeIn.id
  }

  return list
}

// ---------------------------------------------------------------------------
// Test-drives — ~70, com UM conflito real de vendedor plantado nos dados
// ---------------------------------------------------------------------------

const SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

const plusHour = (from: string) => `${pad2(Number(from.slice(0, 2)) + 1)}:${from.slice(3)}`

/** A CNH vale na data? Sem CNH ou vencida, o agendamento recusa. */
function cnhOkAt(customer: Customer, dateKey: string): boolean {
  if (!customer.cnhUntil) return false
  return customer.cnhUntil.slice(0, 10) >= dateKey
}

function buildDrives(rnd: () => number, vehicles: Vehicle[], customers: Customer[]): TestDrive[] {
  const list: TestDrive[] = []
  const taken = new Set<string>()
  const bookable = vehicles.filter((v) => v.state !== 'vendido')
  let id = 1

  const push = (vehicleId: number, customer: Customer, sellerId: number, offset: number, from: string) => {
    const date = dayKey(offset)
    const status: TestDrive['status'] =
      offset >= 0 ? 'agendado' : rnd() < 0.72 ? 'realizado' : rnd() < 0.6 ? 'faltou' : 'cancelado'
    list.push({
      id: id++,
      vehicleId,
      customerId: customer.id,
      sellerId,
      date,
      from,
      to: plusHour(from),
      status,
      cnhOk: cnhOkAt(customer, date),
    })
  }

  let guard = 0
  while (list.length < 69 && guard < 4000) {
    guard++
    const vehicle = bookable[Math.floor(rnd() * bookable.length)]
    const customer = customers[Math.floor(rnd() * customers.length)]
    const seller = SELLERS[Math.floor(rnd() * SELLERS.length)]
    const offset = -21 + Math.floor(rnd() * 36)
    const from = SLOTS[Math.floor(rnd() * SLOTS.length)]
    const date = dayKey(offset)

    const vKey = `v:${vehicle.id}|${date}|${from}`
    const sKey = `s:${seller.id}|${date}|${from}`
    if (taken.has(vKey) || taken.has(sKey)) continue
    taken.add(vKey)
    taken.add(sKey)
    push(vehicle.id, customer, seller.id, offset, from)
  }

  // O conflito plantado: dois test-drives amanha, as 10h, com o MESMO vendedor
  // em veiculos diferentes. A agenda precisa apontar isso.
  const conflictSeller = SELLERS[1]
  push(bookable[3].id, customers[8], conflictSeller.id, 1, '10:00')
  push(bookable[17].id, customers[41], conflictSeller.id, 1, '10:00')

  return list
}

// ---------------------------------------------------------------------------
// Semente completa
// ---------------------------------------------------------------------------

export interface SeedData {
  brands: Brand[]
  models: Model[]
  vehicles: Vehicle[]
  customers: Customer[]
  sellers: Seller[]
  deals: Deal[]
  tradeIns: TradeIn[]
  drives: TestDrive[]
  rules: Rules
  seededAt: number
}

export function seedData(): SeedData {
  const rnd = mulberry32(20260905)
  const customers = buildCustomers(rnd)
  const vehicles = buildVehicles(rnd)
  const deals = buildDeals(rnd, vehicles, customers)
  const tradeIns = buildTradeIns(rnd, deals, customers)
  const drives = buildDrives(rnd, vehicles, customers)

  return {
    brands: BRANDS,
    models: MODELS,
    vehicles,
    customers,
    sellers: SELLERS,
    deals,
    tradeIns,
    drives,
    rules: RULES,
    seededAt: Date.now(),
  }
}

/** Dados da loja usados no site publico e nas configuracoes. */
export const STORE = {
  name: 'Garagem',
  legalName: 'Garagem Veículos Ltda.',
  address: 'Av. Brigadeiro Faria Lima, 2140 — Jardim Paulistano, São Paulo/SP',
  phone: '(11) 3555-2040',
  whatsapp: '(11) 98877-2040',
  email: 'contato@garagem.com.br',
  hours: 'Seg a sex 9h–19h · Sáb 9h–15h',
  coverSeed: 'vitrine-destaque',
  storeSeed: 'loja-fachada-garagem',
}
