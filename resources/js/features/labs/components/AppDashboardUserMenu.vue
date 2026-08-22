<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DropdownMenuItem } from '@nuxt/ui';

defineProps<{
    collapsed?: boolean;
}>();

const user = ref({
    name: 'Benjamin Canac',
    avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: 'Benjamin Canac',
    },
});

const appearance = ref<'light' | 'dark'>(document.documentElement.classList.contains('app-dark') ? 'dark' : 'light');
const primary = ref<'green' | 'rose'>(
    document.documentElement.dataset.dashboardLabPrimary === 'rose' ? 'rose' : 'green',
);

const setAppearance = (value: 'light' | 'dark') => {
    appearance.value = value;
    document.documentElement.classList.toggle('app-dark', value === 'dark');
    document.documentElement.classList.toggle('dark', value === 'dark');
};

const setPrimary = (value: 'green' | 'rose') => {
    primary.value = value;
    document.documentElement.dataset.dashboardLabPrimary = value;
};

const items = computed<DropdownMenuItem[][]>(() => [
    [
        {
            type: 'label',
            label: user.value.name,
            avatar: user.value.avatar,
        },
    ],
    [
        {
            label: 'Profile',
            icon: 'i-lucide-user',
        },
        {
            label: 'Billing',
            icon: 'i-lucide-credit-card',
        },
        {
            label: 'Settings',
            icon: 'i-lucide-settings',
        },
    ],
    [
        {
            label: 'Theme',
            icon: 'i-lucide-palette',
            children: [
                {
                    label: 'Green',
                    chip: 'green',
                    slot: 'chip',
                    type: 'checkbox',
                    checked: primary.value === 'green',
                    onSelect(event: Event) {
                        event.preventDefault();
                        setPrimary('green');
                    },
                },
                {
                    label: 'Rose',
                    chip: 'rose',
                    slot: 'chip',
                    type: 'checkbox',
                    checked: primary.value === 'rose',
                    onSelect(event: Event) {
                        event.preventDefault();
                        setPrimary('rose');
                    },
                },
            ],
        },
        {
            label: 'Appearance',
            icon: 'i-lucide-sun-moon',
            children: [
                {
                    label: 'Light',
                    icon: 'i-lucide-sun',
                    type: 'checkbox',
                    checked: appearance.value === 'light',
                    onSelect(event: Event) {
                        event.preventDefault();
                        setAppearance('light');
                    },
                },
                {
                    label: 'Dark',
                    icon: 'i-lucide-moon',
                    type: 'checkbox',
                    checked: appearance.value === 'dark',
                    onSelect(event: Event) {
                        event.preventDefault();
                        setAppearance('dark');
                    },
                },
            ],
        },
    ],
    [
        {
            label: 'Templates',
            icon: 'i-lucide-layout-template',
        },
    ],
    [
        {
            label: 'Documentation',
            icon: 'i-lucide-book-open',
            to: 'https://ui.nuxt.com/docs/getting-started/installation/vue',
            target: '_blank',
        },
        {
            label: 'GitHub repository',
            icon: 'simple-icons:github',
            to: 'https://github.com/nuxt-ui-templates/dashboard-vue',
            target: '_blank',
        },
    ],
    [
        {
            label: 'Log out',
            icon: 'i-lucide-log-out',
        },
    ],
]);
</script>

<template>
    <UDropdownMenu
        :items="items"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    >
        <UButton
            v-bind="{
                ...user,
                label: collapsed ? undefined : user?.name,
                trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
            }"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
            :ui="{ trailingIcon: 'text-dimmed' }"
        />

        <template #chip-leading="{ item }">
            <div class="inline-flex size-5 shrink-0 items-center justify-center">
                <span
                    class="size-2 rounded-full ring ring-bg"
                    :style="{
                        backgroundColor: (item as any).chip === 'rose' ? 'var(--color-rose-500)' : 'var(--color-green-500)',
                    }"
                />
            </div>
        </template>
    </UDropdownMenu>
</template>
