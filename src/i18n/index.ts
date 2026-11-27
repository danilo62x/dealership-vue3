import { createI18n } from 'vue-i18n'

import ptBR from './locales/pt-BR.json'
import en from './locales/en.json'
import es from './locales/es.json'

export const LANGUAGES = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

type Messages = { [key: string]: string | Messages }

/**
 * Os arquivos de tradução são compartilhados byte a byte com os outros
 * frameworks, que seguem as convenções do i18next:
 *  - marcadores `{{name}}` — o vue-i18n espera `{name}`;
 *  - pares `key_one` / `key_other` — o vue-i18n espera uma única `key` cuja
 *    mensagem é `singular | plural`;
 *  - `@` e `|` são operadores do compilador do vue-i18n (link de mensagem e
 *    separador de plural). Um e-mail de exemplo — `contato@garagem.com.br` —
 *    ou um "A | B" solto numa mensagem estoura a compilação e a rota renderiza
 *    **em branco** no build de produção, em silêncio. Por isso o `@` vira o
 *    literal `{'@'}` aqui, no carregador, e nunca no JSON.
 * Tudo é normalizado uma vez na inicialização para o JSON continuar idêntico
 * em todos os builds.
 */
function normalize(node: Messages): Messages {
  const out: Messages = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = typeof value === 'string' ? escapeReserved(value) : normalize(value)
  }

  // Junta os pares `_one` / `_other` na forma de plural do vue-i18n.
  for (const key of Object.keys(out)) {
    if (!key.endsWith('_one')) continue
    const base = key.slice(0, -4)
    const other = `${base}_other`
    const one = out[key]
    const many = out[other]
    if (typeof one !== 'string') continue
    out[base] = typeof many === 'string' ? `${one} | ${many}` : one
    delete out[key]
    delete out[other]
  }

  return out
}

/**
 * `{{name}}` -> `{name}` e os reservados do vue-i18n neutralizados: `@` vira
 * `{'@'}` e o `|` solto vira `{'|'}`. A troca do plural acontece depois desta
 * função, então o `|` que ela cria é preservado.
 */
function escapeReserved(message: string): string {
  return message
    .replace(/\{\{\s*(\w+)\s*\}\}/g, '{$1}')
    .replace(/@/g, "{'@'}")
    .replace(/\|/g, "{'|'}")
}

const stored = localStorage.getItem('lang')
const browser = navigator.language
const initial = stored ?? (LANGUAGES.find((l) => l.code === browser)?.code ?? (browser.startsWith('pt') ? 'pt-BR' : 'pt-BR'))

const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: 'pt-BR',
  messages: {
    'pt-BR': normalize(ptBR as Messages),
    en: normalize(en as Messages),
    es: normalize(es as Messages),
  },
})

export function setLanguage(code: LanguageCode) {
  i18n.global.locale.value = code
  localStorage.setItem('lang', code)
  document.documentElement.lang = code
}

export default i18n
