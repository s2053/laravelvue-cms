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
    <div v-if="collapsed">
        <UTooltip v-if="!item.children?.length" :text="item.label" :content="{ side: 'right', sideOffset: 8 }">
            <router-link
                v-if="item.to"
                :to="item.to"
                :class="[
                    'app-shell-nav-item flex items-center justify-center gap-1.5 px-1.5 py-1.5 text-sm transition-colors',
                    isActive ? 'is-active' : '',
                ]"
            >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
            </router-link>
            <button
                v-else
                type="button"
                :class="['app-shell-nav-item flex w-full items-center justify-center gap-1.5 px-1.5 py-1.5 text-sm transition-colors']"
            >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
            </button>
        </UTooltip>

        <UPopover v-else :content="{ side: 'right', align: 'start', sideOffset: 8 }">
            <button
                type="button"
                :class="[
                    'app-shell-nav-item flex w-full items-center justify-center gap-1.5 px-1.5 py-1.5 text-sm transition-colors',
                    isActive ? 'is-active' : '',
                ]"
            >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
            </button>

            <template #content="{ close }">
                <div class="w-52 p-1">
                    <div class="text-highlighted px-2.5 py-1.5 text-xs font-semibold">{{ item.label }}</div>
                    <ul>
                        <li v-for="child in item.children" :key="child.label">
                            <router-link
                                :to="child.to || '#'"
                                class="app-shell-nav-child block p-1.5 text-sm transition-colors"
                                :class="route.path === child.to ? 'is-active' : ''"
                                @click="close"
                            >
                                {{ child.label }}
                            </router-link>
                        </li>
                    </ul>
                </div>
            </template>
        </UPopover>
    </div>

    <div v-else>
        <router-link
            v-if="item.to && !item.children?.length"
            :to="item.to"
            :class="['app-shell-nav-item flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium transition-colors', isActive ? 'is-active' : '']"
        >
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
            <UBadge v-if="!collapsed && item.badge" color="neutral" variant="soft" :label="item.badge" />
        </router-link>

        <button
            v-else
            type="button"
            :class="[
                'app-shell-nav-item flex w-full items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'is-active' : '',
            ]"
            @click="isOpen = !isOpen"
        >
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span v-if="!collapsed" class="flex-1 truncate text-left">{{ item.label }}</span>
            <UIcon
                v-if="!collapsed && item.children?.length"
                :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="app-shell-nav-caret size-4"
            />
        </button>

        <ul v-if="item.children?.length && isOpen" class="border-default ms-5 border-s">
            <li v-for="child in item.children" :key="child.label" class="-ms-px ps-1.5">
                <router-link
                    :to="child.to || '#'"
                    :class="['app-shell-nav-child block p-1.5 text-sm transition-colors', route.path === child.to ? 'is-active' : '']"
                >
                    {{ child.label }}
                </router-link>
            </li>
        </ul>
    </div>
</template>
