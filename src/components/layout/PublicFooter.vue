<template>
  <footer class="surface-card border-t border-themed">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col items-start justify-between gap-8 lg:flex-row">
        <div class="max-w-sm">
          <RouterLink to="/" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <IconBase name="car" :size="18" />
            </span>
            <span class="text-lg font-bold text-heading">{{ t('brand') }}</span>
          </RouterLink>
          <p class="mt-4 text-sm text-muted">{{ t('footer.tagline') }}</p>
          <p class="mt-4 text-xs text-muted">{{ STORE.address }}</p>
          <p class="text-xs text-muted">{{ STORE.phone }} · {{ STORE.hours }}</p>
        </div>

        <div class="flex flex-wrap gap-x-10 gap-y-2 text-sm">
          <RouterLink to="/estoque" class="text-muted transition hover:text-brand-600">{{ t('nav.stock') }}</RouterLink>
          <RouterLink
            v-for="category in CATEGORIES"
            :key="category"
            :to="`/estoque?segmento=${category}`"
            class="text-muted transition hover:text-brand-600"
          >
            {{ t(`spec.category.${category}`) }}
          </RouterLink>
          <RouterLink to="/financiamento" class="text-muted transition hover:text-brand-600">
            {{ t('nav.finance') }}
          </RouterLink>
          <RouterLink to="/test-drive" class="text-muted transition hover:text-brand-600">
            {{ t('nav.testDrive') }}
          </RouterLink>
          <RouterLink to="/vender-meu-carro" class="text-muted transition hover:text-brand-600">
            {{ t('nav.sellCar') }}
          </RouterLink>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-themed pt-6 sm:flex-row">
        <p class="text-xs text-muted">© {{ year }} {{ t('brand') }}. {{ t('footer.rights') }}</p>
        <div class="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
          <RouterLink to="/vender-meu-carro" class="hover:text-brand-500">{{ t('footer.notice') }}</RouterLink>
          <a href="#" class="hover:text-brand-500">{{ t('footer.privacy') }}</a>
          <a href="#" class="hover:text-brand-500">{{ t('footer.terms') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconBase from '@/components/ui/IconBase.vue'
import { STORE } from '@/data/mock'

const CATEGORIES = ['hatch', 'sedan', 'suv', 'picape'] as const

const { t } = useI18n()
const year = new Date().getFullYear()
</script>
