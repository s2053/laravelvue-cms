import { useAppColorMode, type AppAppearance } from '@/composables/useAppColorMode';
import { useAuthStore } from '@/features/auth/auth.store';
import { watch } from 'vue';

function normalizeAppearance(value: unknown): AppAppearance | null {
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
}

export function usePreferencesSync() {
    const auth = useAuthStore();
    const colorMode = useAppColorMode();

    watch(
        () => auth.user?.preferences?.appearance,
        (value) => {
            const appearance = normalizeAppearance(value);
            if (appearance) colorMode.setAppearance(appearance);
        },
        { immediate: true },
    );

    return colorMode;
}
