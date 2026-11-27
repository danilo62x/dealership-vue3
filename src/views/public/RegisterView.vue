<template>
  <AuthShell :title="t('auth.registerTitle')" :subtitle="t('auth.registerSubtitle')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-2 block text-sm font-medium text-heading" for="name">{{ t('auth.name') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconBase name="user" :size="18" />
          </span>
          <input id="name" v-model="name" type="text" required placeholder="Camila Barreto" :class="CONTROL" />
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-heading" for="email">{{ t('auth.email') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconBase name="mail" :size="18" />
          </span>
          <input id="email" v-model="email" type="email" required placeholder="voce@garagem.com.br" :class="CONTROL" />
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-heading" for="password">{{ t('auth.password') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconBase name="lock" :size="18" />
          </span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            :class="`${CONTROL} pr-10`"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            :aria-label="t('auth.password')"
            @click="showPassword = !showPassword"
          >
            <IconBase :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
          </button>
        </div>
      </div>

      <label class="flex items-start gap-2 text-sm text-body">
        <input
          v-model="accepted"
          type="checkbox"
          required
          class="mt-0.5 h-4 w-4 rounded border-themed accent-brand-500"
        />
        <span class="min-w-0">{{ t('auth.terms') }}</span>
      </label>

      <button
        type="submit"
        :disabled="loading"
        class="focus-ring flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {{ t('auth.registering') }}
        </span>
        <template v-else>{{ t('auth.registerCta') }}</template>
      </button>

      <p
        v-if="error"
        class="rounded-lg bg-error-50 px-4 py-2 text-center text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500"
      >
        {{ error }}
      </p>
    </form>

    <template #footer>
      {{ t('auth.hasAccount') }}
      <RouterLink to="/login" class="font-medium text-brand-500 hover:text-brand-600">
        {{ t('auth.loginLink') }}
      </RouterLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import IconBase from '@/components/ui/IconBase.vue'
import AuthShell from '@/components/layout/AuthShell.vue'

const CONTROL =
  'focus-ring h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-3 text-sm text-body outline-none focus:border-brand-300 dark:bg-gray-900'

const { t } = useI18n()
usePageTitle(() => t('auth.registerTitle'))

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const accepted = ref(false)
const loading = ref(false)
const error = ref('')

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

async function handleSubmit() {
  error.value = ''
  loading.value = true
  const ok = await auth.register(name.value, email.value, password.value)
  loading.value = false
  if (!ok) {
    error.value = t('auth.loginError')
    return
  }
  ui.notifySuccess(t('auth.registerSuccess'))
  router.push('/app')
}
</script>
