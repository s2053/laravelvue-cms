<script setup lang="ts">
import { ref } from 'vue';
import AppDashboardTeamMenu from './AppDashboardTeamMenu.vue';
import AppDashboardUserMenu from './AppDashboardUserMenu.vue';

const openGroups = ref<Record<string, boolean>>({
    Settings: true,
});

const toggleGroup = (label: string) => {
    openGroups.value[label] = !openGroups.value[label];
};

defineProps<{
    title: string;
    subtitle: string;
    collapsed?: boolean;
    navigation: Array<{
        label: string;
        items: Array<{
            label: string;
            icon: string;
            badge?: string;
            active?: boolean;
            children?: Array<{
                label: string;
                active?: boolean;
            }>;
        }>;
    }>;
}>();
</script>

<template>
    <aside
        :class="[
            'hidden h-screen shrink-0 border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900',
            collapsed ? 'w-20 p-3' : 'w-72 p-4',
        ]"
    >
        <div class="mb-4">
            <AppDashboardTeamMenu :title="title" :subtitle="subtitle" :collapsed="collapsed" />
        </div>

        <div class="mb-5">
            <UInput v-if="!collapsed" icon="i-lucide-search" placeholder="Search..." :ui="{ root: 'w-full', base: 'h-10' }">
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
            <section class="space-y-1">
                <div v-for="item in navigation[0]?.items || []" :key="item.label" class="space-y-1">
                    <button
                        type="button"
                        :class="[
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            item.active
                                ? 'bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white'
                                : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800',
                            collapsed ? 'justify-center px-2' : '',
                        ]"
                        @click="item.children?.length ? toggleGroup(item.label) : undefined"
                    >
                        <UIcon :name="item.icon" class="size-4" />
                        <span v-if="!collapsed" class="flex-1 text-left">{{ item.label }}</span>
                        <UBadge v-if="!collapsed && item.badge" color="neutral" variant="soft" :label="item.badge" />
                        <UIcon
                            v-if="!collapsed && item.children?.length"
                            :name="openGroups[item.label] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                            class="size-4 text-slate-400"
                        />
                    </button>

                    <div
                        v-if="!collapsed && item.children?.length && openGroups[item.label]"
                        class="ml-6 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-800"
                    >
                        <button
                            v-for="child in item.children"
                            :key="child.label"
                            type="button"
                            :class="[
                                'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                child.active
                                    ? 'bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white'
                                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                            ]"
                        >
                            {{ child.label }}
                        </button>
                    </div>
                </div>
            </section>

            <div class="mt-auto space-y-5 pt-6">
                <section class="space-y-1">
                    <button
                        v-for="item in navigation[1]?.items || []"
                        :key="item.label"
                        type="button"
                        :class="[
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800',
                            collapsed ? 'justify-center px-2' : '',
                        ]"
                    >
                        <UIcon :name="item.icon" class="size-4" />
                        <span v-if="!collapsed" class="flex-1 text-left">{{ item.label }}</span>
                    </button>
                </section>

                <div class="border-t border-slate-200 pt-4 dark:border-slate-800">
                    <AppDashboardUserMenu :collapsed="collapsed" />
                </div>
            </div>
        </div>
    </aside>
</template>
