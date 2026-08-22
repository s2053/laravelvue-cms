<script setup lang="ts">
import { useAuthStore } from '@/features/auth/auth.store';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DropdownMenuItem } from '@nuxt/ui';

const props = defineProps<{
    collapsed?: boolean;
}>();

const auth = useAuthStore();
const toast = useToast();
const router = useRouter();

const appearance = ref<'light' | 'dark'>(document.documentElement.classList.contains('app-dark') ? 'dark' : 'light');

const user = computed(() => ({
    name: auth.user?.name || 'Account',
    avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: auth.user?.name || 'Account',
    },
}));

const setAppearance = (value: 'light' | 'dark') => {
    appearance.value = value;
    document.documentElement.classList.toggle('app-dark', value === 'dark');
    document.documentElement.classList.toggle('dark', value === 'dark');
};

const logout = async () => {
    await auth.logout();
    toast.add({ severity: 'success', summary: 'Logged out', detail: 'You have successfully logged out.' });
    router.push('/login');
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
            to: '/dashboard/account/profile',
        },
        {
            label: 'Settings',
            icon: 'i-lucide-settings',
            to: '/dashboard/account/preferences',
        },
    ],
    [
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
            label: 'Log out',
            icon: 'i-lucide-log-out',
            onSelect(event: Event) {
                event.preventDefault();
                void logout();
            },
        },
    ],
]);
</script>

<template>
    <UDropdownMenu
        :items="items"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: `${collapsed ? 'w-56' : 'w-(--reka-dropdown-menu-trigger-width)'} z-[80]` }"
    >
        <UButton
            v-bind="{
                ...user,
                label: collapsed ? undefined : user.name,
                trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
            }"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
            :ui="{ trailingIcon: 'text-dimmed' }"
        />
    </UDropdownMenu>
</template>
