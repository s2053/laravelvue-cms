<script setup lang="ts">
import { useAppColorMode, type AppAppearance } from '@/composables/useAppColorMode';
import { useAppToast } from '@/composables/useAppToast';
import { useThemePreset } from '@/composables/useThemePreset';
import { useAccount } from '@/features/account/composables';
import { useAuthStore } from '@/features/auth/auth.store';
import { isThemePresetId } from '@/theme/presets';
import type { DropdownMenuItem } from '@nuxt/ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
    collapsed?: boolean;
}>();

const auth = useAuthStore();
const colorMode = useAppColorMode();
const { activePreset, setPreset, themePresetOptions } = useThemePreset();
const { updatePreferences } = useAccount({ onError: () => undefined });
const toast = useAppToast();
const router = useRouter();
const savingAppearance = ref(false);

const user = computed(() => ({
    name: auth.user?.name || 'Account',
    avatar: {
        src: 'https://github.com/benjamincanac.png',
        alt: auth.user?.name || 'Account',
    },
}));

const setAppearance = async (value: AppAppearance) => {
    if (savingAppearance.value || colorMode.appearance.value === value) return;

    const previousAppearance = colorMode.appearance.value;
    colorMode.setAppearance(value);

    if (!auth.user) return;

    savingAppearance.value = true;
    try {
        const updated = await updatePreferences({ ...auth.user.preferences, appearance: value });
        auth.setUser(updated);
    } catch (error: any) {
        colorMode.setAppearance(previousAppearance);
        toast.error('Error', error.message || 'Could not save appearance preference.', { duration: 4000 });
    } finally {
        savingAppearance.value = false;
    }
};

const logout = async () => {
    await auth.logout();
    toast.success('Logged out', 'You have successfully logged out.');
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
            label: 'Preset',
            icon: 'i-lucide-palette',
            children: themePresetOptions.map((preset) => ({
                label: preset.label,
                type: 'checkbox' as const,
                checked: activePreset.value.id === preset.id,
                onSelect(event: Event) {
                    event.preventDefault();
                    if (isThemePresetId(preset.id)) {
                        setPreset(preset.id);
                    }
                },
            })),
        },
        {
            label: 'Appearance',
            icon: 'i-lucide-sun-moon',
            children: [
                {
                    label: 'Light',
                    icon: 'i-lucide-sun',
                    type: 'checkbox',
                    checked: colorMode.appearance.value === 'light',
                    onSelect(event: Event) {
                        event.preventDefault();
                        void setAppearance('light');
                    },
                },
                {
                    label: 'Dark',
                    icon: 'i-lucide-moon',
                    type: 'checkbox',
                    checked: colorMode.appearance.value === 'dark',
                    onSelect(event: Event) {
                        event.preventDefault();
                        void setAppearance('dark');
                    },
                },
                {
                    label: 'System',
                    icon: 'i-lucide-monitor',
                    type: 'checkbox',
                    checked: colorMode.appearance.value === 'system',
                    onSelect(event: Event) {
                        event.preventDefault();
                        void setAppearance('system');
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
