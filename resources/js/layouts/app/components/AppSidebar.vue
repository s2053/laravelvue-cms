<script setup lang="ts">
import AppMenu from '@/layouts/app/components/AppMenu.vue';
import AppUserMenu from '@/layouts/app/components/AppUserMenu.vue';
import { useLayout } from '@/layouts/app/composables/layout';
import { computed } from 'vue';

const { layoutState } = useLayout();

const sidebarClasses = computed(() => [
    'app-shell-sidebar fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col transition-all duration-200 lg:static lg:z-auto',
    layoutState.staticMenuDesktopInactive ? 'w-20 px-3 py-4' : 'w-72 p-4',
    layoutState.staticMenuMobileActive ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
]);
</script>

<template>
    <aside :class="sidebarClasses">
        <div class="mb-4">
            <UButton
                color="neutral"
                variant="ghost"
                block
                :square="layoutState.staticMenuDesktopInactive"
                :label="layoutState.staticMenuDesktopInactive ? undefined : 'CMS Control'"
                icon="i-lucide-panel-left"
                trailing-icon="i-lucide-chevrons-up-down"
                class="data-[state=open]:bg-elevated"
            />
        </div>

        <div class="mb-5">
            <UInput
                v-if="!layoutState.staticMenuDesktopInactive"
                icon="i-lucide-search"
                placeholder="Search..."
                :ui="{ root: 'w-full', base: 'h-10' }"
            >
                <template #trailing>
                    <div class="hidden items-center gap-1 sm:flex">
                        <UKbd value="CTRL" class="text-[10px]" />
                        <UKbd value="K" class="text-[10px]" />
                    </div>
                </template>
            </UInput>
            <UButton v-else color="neutral" variant="ghost" icon="i-lucide-search" block square />
        </div>

        <div class="flex min-h-0 flex-1 flex-col">
            <AppMenu :collapsed="layoutState.staticMenuDesktopInactive" />

            <div class="app-shell-divider mt-4 pt-4">
                <AppUserMenu :collapsed="layoutState.staticMenuDesktopInactive" />
            </div>
        </div>
    </aside>
</template>
