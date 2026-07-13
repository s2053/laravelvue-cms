<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
interface MenuChild {
    label: string;
    to?: string;
}

interface MenuItem {
    label: string;
    icon: string;
    to?: string;
    badge?: string;
    children?: MenuChild[];
}

const props = defineProps<{
    item: MenuItem;
    collapsed?: boolean;
}>();

const isOpen = ref(false);

const isActive = computed(() => {
    if (props.item.to) {
        return route.path === props.item.to;
    }

    return props.item.children?.some((child) => child.to === route.path) ?? false;
});

watch(
    () => route.path,
    () => {
        if (props.item.children?.some((child) => child.to === route.path)) {
            isOpen.value = true;
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="space-y-1">
        <router-link
            v-if="item.to && !item.children?.length"
            :to="item.to"
            :class="[
                'app-shell-nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'is-active' : '',
                collapsed ? 'justify-center px-2' : '',
            ]"
        >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
            <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
            <UBadge v-if="!collapsed && item.badge" color="neutral" variant="soft" :label="item.badge" />
        </router-link>

        <button
            v-else
            type="button"
            :class="[
                'app-shell-nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'is-active' : '',
                collapsed ? 'justify-center px-2' : '',
            ]"
            @click="isOpen = !isOpen"
        >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
            <span v-if="!collapsed" class="flex-1 truncate text-left">{{ item.label }}</span>
            <UIcon
                v-if="!collapsed && item.children?.length"
                :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="app-shell-nav-caret size-4"
            />
        </button>

        <div
            v-if="!collapsed && item.children?.length && isOpen"
            class="app-shell-nav-children ml-6 space-y-1 pl-4"
        >
            <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.to || '#'"
                :class="[
                    'app-shell-nav-child block rounded-lg px-3 py-2 text-sm transition-colors',
                    route.path === child.to ? 'is-active' : '',
                ]"
            >
                {{ child.label }}
            </router-link>
        </div>
    </div>
</template>
