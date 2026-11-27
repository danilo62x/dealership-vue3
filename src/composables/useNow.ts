import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Relógio compartilhado da aplicação inteira.
 *
 * Toda derivação que depende de "agora" — dias em estoque, giro lento, agenda
 * do test-drive, funil dos últimos 90 dias — lê **este** valor. É uma leitura
 * só por render: se cada card chamasse `Date.now()` por conta própria, dois
 * cards da mesma lista poderiam cair em dias diferentes e o contador de dias
 * em estoque mudaria a cada F5.
 *
 * Existe um único `setInterval` para a página toda, ligado quando o primeiro
 * componente assina e desligado quando o último sai. O passo é de um minuto:
 * nada aqui muda de segundo em segundo.
 */
const STEP_MS = 60_000

const now = ref(Date.now())
let timer: number | null = null
let subscribers = 0

function subscribe() {
  subscribers++
  if (timer === null) {
    timer = window.setInterval(() => {
      now.value = Date.now()
    }, STEP_MS)
  }
}

function unsubscribe() {
  subscribers = Math.max(0, subscribers - 1)
  if (subscribers === 0 && timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

/** Milissegundos de "agora", estável dentro do mesmo minuto. */
export function useNow(): Ref<number> {
  onMounted(subscribe)
  onUnmounted(unsubscribe)
  return now
}
