import { useAuthStore } from '@/features/auth/auth.store';
import { useLayout } from '@/layouts/app/composables/layout';
import { watch } from 'vue';

export function usePreferencesSync() {
    const auth = useAuthStore();
    const { layoutConfig, toggleDarkMode } = useLayout();

    // Helper to check current dark mode state
    const applyAppearance = (appearance: string | undefined) => {
        if (!appearance) return;

        if (appearance === 'dark' && !layoutConfig.darkTheme) {
            toggleDarkMode();
        } else if (appearance === 'light' && layoutConfig.darkTheme) {
            toggleDarkMode();
        }
    };

    // Watch for changes in user preference for appearance
    watch(
        () => auth.user?.preferences?.appearance,
        (newAppearance) => {
            applyAppearance(newAppearance);
        },
        { immediate: true },
    );
}
