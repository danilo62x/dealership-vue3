import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Site público
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/estoque',
      name: 'stock',
      component: () => import('@/views/public/StockView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/veiculo/:slug',
      name: 'vehicle',
      component: () => import('@/views/public/VehicleView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/financiamento',
      name: 'finance',
      component: () => import('@/views/public/FinanceView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/test-drive',
      name: 'test-drive',
      component: () => import('@/views/public/TestDriveView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/vender-meu-carro',
      name: 'sell-car',
      component: () => import('@/views/public/SellCarView.vue'),
      meta: { layout: 'public' },
    },

    // Autenticação (layout em branco)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/registro',
      name: 'register',
      component: () => import('@/views/public/RegisterView.vue'),
      meta: { layout: 'blank' },
    },

    // Área do showroom (guardada, layout com sidebar)
    {
      path: '/app',
      name: 'dashboard',
      component: () => import('@/views/app/DashboardView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/estoque',
      name: 'stock-admin',
      component: () => import('@/views/app/StockAdminView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/veiculo/:id',
      name: 'vehicle-admin',
      component: () => import('@/views/app/VehicleAdminView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/propostas',
      name: 'deals',
      component: () => import('@/views/app/DealsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/proposta/:id',
      name: 'deal',
      component: () => import('@/views/app/DealView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/test-drives',
      name: 'drives',
      component: () => import('@/views/app/DrivesView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/avaliacoes',
      name: 'appraisals',
      component: () => import('@/views/app/AppraisalsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/clientes',
      name: 'customers',
      component: () => import('@/views/app/CustomersView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/vendedores',
      name: 'sellers',
      component: () => import('@/views/app/SellersView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/configuracoes',
      name: 'settings',
      component: () => import('@/views/app/SettingsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },

    // 404 (layout em branco)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/app/NotFoundView.vue'),
      meta: { layout: 'blank' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Equivalente ao RequireAuth do React: manda para /login?redirect=…
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.path } })
  } else {
    next()
  }
})

export default router
