<template>
  <aside
    :style="{ width: ui.sidebarCollapsed ? '90px' : '280px' }"
    class="surface-sidebar fixed top-0 left-0 z-50 flex h-screen flex-col overflow-y-hidden border-r px-4 transition-[transform,width] duration-300 lg:static lg:translate-x-0"
    :class="ui.sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center pt-7 pb-6" :class="ui.sidebarCollapsed ? 'justify-center' : 'justify-between'">
      <RouterLink to="/app" class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-theme-sm">
          <IconBase name="car" :size="18" />
        </span>
        <span v-if="!ui.sidebarCollapsed" data-brand-text class="text-lg font-semibold">{{ t('brand') }}</span>
      </RouterLink>
      <button
        v-if="!ui.sidebarCollapsed"
        type="button"
        class="is-sidebar-inactive hidden h-8 w-8 items-center justify-center rounded-lg border border-themed lg:flex"
        :title="t('appNav.collapse')"
        @click="ui.toggleSidebar()"
      >
        <IconBase name="chevron-right" :size="14" class-name="rotate-180" />
      </button>
    </div>

    <div class="no-scrollbar flex flex-col gap-5 overflow-y-auto pb-4">
      <nav v-for="section in SECTIONS" :key="section.titleKey">
        <h3 v-if="!ui.sidebarCollapsed" class="mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
          {{ t(section.titleKey) }}
        </h3>
        <ul class="flex flex-col gap-1">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink
              :to="item.to"
              :class="navLinkClass(isActive(item))"
              :title="ui.sidebarCollapsed ? t(item.labelKey) : undefined"
              @click="ui.toggleSidebarMobile(false)"
            >
              <IconBase :name="item.icon" :size="20" />
              <span v-if="!ui.sidebarCollapsed" class="min-w-0 flex-1 truncate">{{ t(item.labelKey) }}</span>
              <span
                v-if="!ui.sidebarCollapsed && item.to === '/app/estoque' && slow > 0"
                class="rounded-full bg-warning-500 px-2 py-0.5 text-[11px] font-semibold text-white"
              >
                {{ slow }}
              </span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-auto space-y-3 border-t border-themed py-4">
      <div v-if="!ui.sidebarCollapsed" class="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
        <p class="text-xs font-medium text-muted">{{ t('appNav.slowTitle') }}</p>
        <p class="mt-0.5 text-sm font-semibold text-heading">{{ t('appNav.slowDesc', { count: slow }, slow) }}</p>
        <RouterLink
          to="/app/estoque?giro=lento"
          class="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-brand-500 text-xs font-medium text-white transition hover:bg-brand-600"
        >
          {{ t('appNav.openSlow') }}
        </RouterLink>
      </div>
      <button
        type="button"
        :class="navLinkClass(false)"
        :title="ui.sidebarCollapsed ? t('appNav.logout') : undefined"
        @click="handleLogout"
      >
        <IconBase name="logout" :size="20" />
        <span v-if="!ui.sidebarCollapsed">{{ t('appNav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDealerStore } from '@/stores/dealer'
import { useNow } from '@/composables/useNow'
import { slowMovers } from '@/data/query'
import IconBase from '@/components/ui/IconBase.vue'

interface NavItem {
  to: string
  labelKey: string
  icon: string
  end?: boolean
}

const SECTIONS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'appNav.salesSection',
    items: [
      { to: '/app', labelKey: 'appNav.dashboard', icon: 'dashboard', end: true },
      { to: '/app/propostas', labelKey: 'appNav.deals', icon: 'handshake' },
      { to: '/app/test-drives', labelKey: 'appNav.drives', icon: 'steering' },
    ],
  },
  {
    titleKey: 'appNav.stockSection',
    items: [
      { to: '/app/estoque', labelKey: 'appNav.stock', icon: 'car' },
      { to: '/app/avaliacoes', labelKey: 'appNav.appraisals', icon: 'calculator' },
    ],
  },
  {
    titleKey: 'appNav.peopleSection',
    items: [
      { to: '/app/clientes', labelKey: 'appNav.customers', icon: 'users' },
      { to: '/app/vendedores', labelKey: 'appNav.sellers', icon: 'user-check' },
    ],
  },
  {
    titleKey: 'appNav.accountSection',
    items: [{ to: '/app/configuracoes', labelKey: 'appNav.settings', icon: 'settings' }],
  },
]

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const now = useNow()

const ui = useUiStore()
const auth = useAuthStore()
const dealer = useDealerStore()

const slow = computed(() => slowMovers(dealer.vehicles, now.value, dealer.rules).length)

function isActive(item: NavItem): boolean {
  return item.end ? route.path === item.to : route.path.startsWith(item.to)
}

function navLinkClass(active: boolean): string {
  return [
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    ui.sidebarCollapsed ? 'justify-center' : '',
    active ? 'is-sidebar-active' : 'is-sidebar-inactive',
  ]
    .filter(Boolean)
    .join(' ')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
