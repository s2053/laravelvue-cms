<script setup lang="ts">
import AppMenu from '@/layouts/app/components/AppMenu.vue';
import AppUserMenu from '@/layouts/app/components/AppUserMenu.vue';
import { useLayout } from '@/layouts/app/composables/layout';

const { layoutState } = useLayout();
</script>

<template>
    <UDashboardSidebar
        v-model:open="layoutState.staticMenuMobileActive"
        v-model:collapsed="layoutState.staticMenuDesktopInactive"
        class="app-shell-sidebar"
        :default-size="240"
        :min-size="200"
        :max-size="320"
        :collapsed-size="64"
        collapsible
        resizable
        mode="slideover"
    >
        <template #header="{ collapsed }">
            <div class="flex min-w-0 flex-1 items-center gap-2">
                <div class="app-shell-brand-mark flex size-7 shrink-0 items-center justify-center rounded-full">
                    <UIcon name="i-lucide-layout-dashboard" class="size-4" />
                </div>
                <span v-if="!collapsed" class="app-shell-brand-title truncate text-sm font-semibold">CMS Control</span>
            </div>
        </template>

        <template #default="{ collapsed }">
            <div>
                <UInput v-if="!collapsed" icon="i-lucide-search" placeholder="Search..." size="sm" :ui="{ root: 'w-full' }">
                    <template #trailing>
                        <div class="hidden items-center gap-1 sm:flex">
                            <UKbd value="CTRL" class="text-[10px]" />
                            <UKbd value="K" class="text-[10px]" />
                        </div>
                    </template>
                </UInput>
                <AppButton v-else color="neutral" variant="ghost" icon="i-lucide-search" block square />
            </div>

            <AppMenu :collapsed="collapsed" />
        </template>

        <template #footer="{ collapsed }">
            <AppUserMenu :collapsed="collapsed" />
        </template>
    </UDashboardSidebar>
</template>
