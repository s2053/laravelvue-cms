<script setup lang="ts">
import { useLayout } from '@/layouts/app/composables/layout';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { toggleMenu, layoutState } = useLayout();

const isDashboardRoute = computed(() => route.path.startsWith('/dashboard'));
const title = computed(() => String(route.meta?.title || (isDashboardRoute.value ? 'Dashboard' : 'My App')));
</script>

<template>
    <header class="app-shell-header">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
                <button
                    v-if="isDashboardRoute"
                    type="button"
                    class="app-shell-action inline-flex h-10 w-10 items-center justify-center rounded-lg transition"
                    @click="toggleMenu"
                >
                    <UIcon :name="layoutState.staticMenuDesktopInactive ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'" class="hidden size-5 lg:block" />
                    <UIcon name="i-lucide-menu" class="size-5 lg:hidden" />
                </button>

                <router-link to="/dashboard" class="flex items-center gap-3 no-underline">

                    <div class="min-w-0">
                        <p class="app-shell-brand-title truncate text-sm font-semibold">Home</p>
                        <p v-if="!isDashboardRoute" class="app-shell-brand-subtitle truncate text-xs">{{ title }}</p>
                    </div>
                </router-link>
            </div>

            <div class="flex items-center gap-2">
                <p v-if="isDashboardRoute" class="app-shell-page-title hidden truncate text-lg font-semibold sm:block">
                    {{ title }}
                </p>

                <button
                    v-if="isDashboardRoute"
                    type="button"
                    class="app-shell-action inline-flex h-10 w-10 items-center justify-center rounded-lg transition"
                >
                    <UChip color="error" inset>
                        <UIcon name="i-lucide-bell" class="size-5" />
                    </UChip>
                </button>

                <button
                    v-if="isDashboardRoute"
                    type="button"
                    class="app-shell-fab inline-flex h-10 w-10 items-center justify-center rounded-full transition"
                >
                    <UIcon name="i-lucide-plus" class="size-5" />
                </button>
            </div>
        </div>
    </header>
</template>
