<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';

const props = defineProps<{
    collapsed?: boolean;
    title: string;
    subtitle?: string;
}>();

const teams = ref([
    {
        label: props.title,
        avatar: {
            src: 'https://github.com/vuejs.png',
            alt: props.title,
        },
    },
    {
        label: 'Vite',
        avatar: {
            src: 'https://github.com/vitejs.png',
            alt: 'Vite',
        },
    },
    {
        label: 'Nuxt UI',
        avatar: {
            src: 'https://github.com/nuxt.png',
            alt: 'Nuxt UI',
        },
    },
]);

const selectedTeam = ref(teams.value[0]);

const items = computed<DropdownMenuItem[][]>(() => [
    teams.value.map((team) => ({
        ...team,
        onSelect() {
            selectedTeam.value = team;
        },
    })),
    [
        {
            label: 'Create team',
            icon: 'i-lucide-circle-plus',
        },
        {
            label: 'Manage teams',
            icon: 'i-lucide-cog',
        },
    ],
]);
</script>

<template>
    <UDropdownMenu
        :items="items"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    >
        <UButton
            v-bind="{
                ...selectedTeam,
                label: collapsed ? undefined : selectedTeam?.label,
                trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
            }"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
            :class="[!collapsed && 'py-2']"
            :ui="{ trailingIcon: 'text-dimmed' }"
        />
    </UDropdownMenu>
</template>
