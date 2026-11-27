<template>
  <div>
    <PageHeader
      :title="t('deals.title')"
      :subtitle="t('deals.subtitle')"
      :crumbs="[{ label: t('appNav.dashboard'), href: '/app', icon: 'dashboard' }, { label: t('deals.title') }]"
    />
    <DealBoard />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import PageHeader from '@/components/app/PageHeader.vue'
import DealBoard from '@/components/dl/DealBoard.vue'

const { t } = useI18n()
usePageTitle(() => t('deals.title'))
</script>
