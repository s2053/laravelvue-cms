<script setup lang="ts">
import { AppDashboardNavbar, AppDashboardShell, AppDashboardSidebar, AppDashboardSurface } from '@/features/labs/components';
import { ref } from 'vue';

const sidebarCollapsed = ref(false);

const navigation = [
    {
        label: 'Main',
        items: [
            { label: 'Home', icon: 'i-lucide-house', active: true },
            { label: 'Inbox', icon: 'i-lucide-inbox', badge: '4' },
            { label: 'Customers', icon: 'i-lucide-users' },
            {
                label: 'Settings',
                icon: 'i-lucide-settings',
                children: [{ label: 'General' }, { label: 'Members' }, { label: 'Notifications' }, { label: 'Security' }],
            },
        ],
    },
    {
        label: 'Support',
        items: [
            { label: 'Feedback', icon: 'i-lucide-message-circle' },
            { label: 'Help & Support', icon: 'i-lucide-info' },
        ],
    },
];

const stats = [
    { label: 'Customers', value: '484', delta: '+11%', icon: 'i-lucide-users' },
    { label: 'Conversions', value: '1182', delta: '+5%', icon: 'i-lucide-chart-column' },
    { label: 'Revenue', value: '$400,933', delta: '+25%', icon: 'i-lucide-badge-dollar-sign' },
    { label: 'Orders', value: '158', delta: '+2%', icon: 'i-lucide-shopping-cart' },
];

const bars = [18, 24, 32, 44, 58, 66, 38, 26, 34, 48, 42, 55, 62, 46];
</script>

<template>
    <AppDashboardShell>
        <template #sidebar>
            <AppDashboardSidebar title="Vue" subtitle="Dashboard template" :navigation="navigation" :collapsed="sidebarCollapsed" />
        </template>

        <UDashboardPanel id="dashboard-lab-home">
            <template #header>
                <AppDashboardNavbar title="Home">
                    <template #leading>
                        <UButton
                            color="neutral"
                            variant="ghost"
                            :icon="sidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
                            class="hidden lg:inline-flex"
                            @click="sidebarCollapsed = !sidebarCollapsed"
                        />
                        <UButton color="neutral" variant="ghost" icon="i-lucide-menu" class="lg:hidden" />
                    </template>

                    <template #right>
                        <UButton color="neutral" variant="ghost" square aria-label="Notifications">
                            <UChip color="error" inset>
                                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                            </UChip>
                        </UButton>
                        <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
                    </template>
                </AppDashboardNavbar>

                <UDashboardToolbar>
                    <template #left>
                        <div class="flex flex-wrap items-center gap-2 text-sm">
                            <UButton color="neutral" variant="ghost" icon="i-lucide-calendar">Jun 24, 2026 - Jul 8, 2026</UButton>
                            <UButton color="neutral" variant="ghost">Daily</UButton>
                        </div>
                    </template>
                </UDashboardToolbar>
            </template>

            <template #body>
                <div class="grid gap-4 xl:grid-cols-4">
                    <AppDashboardSurface v-for="stat in stats" :key="stat.label">
                        <div class="flex flex-col gap-5">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <UIcon :name="stat.icon" class="text-xl" />
                            </div>

                            <div class="space-y-1">
                                <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
                                <div class="flex items-center gap-2">
                                    <p class="text-4xl font-semibold tracking-tight">{{ stat.value }}</p>
                                    <UBadge color="success" variant="soft" :label="stat.delta" />
                                </div>
                            </div>
                        </div>
                    </AppDashboardSurface>
                </div>

                <div class="mt-6">
                    <AppDashboardSurface>
                        <template #header>
                            <div class="space-y-1">
                                <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Revenue</p>
                                <div class="text-5xl font-semibold tracking-tight">$74,243</div>
                            </div>
                        </template>

                        <div class="h-80 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div class="dashboard-lab__chart">
                                <div
                                    v-for="(bar, index) in bars"
                                    :key="index"
                                    class="dashboard-lab__chart-bar"
                                    :style="{ height: `${bar}%` }"
                                />
                            </div>
                        </div>
                    </AppDashboardSurface>
                </div>
            </template>
        </UDashboardPanel>
    </AppDashboardShell>
</template>
