import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';

export type AppAppearance = 'light' | 'dark' | 'system';

type AppColorMode = ReturnType<typeof useColorMode>;

let colorMode: AppColorMode | null = null;

function getColorMode() {
    colorMode ??= useColorMode({
        attribute: 'class',
        disableTransition: true,
        initialValue: 'auto',
        modes: {
            auto: '',
            light: '',
            dark: 'dark',
        },
        selector: 'html',
        storageKey: 'vueuse-color-scheme',
    });

    return colorMode;
}

export function useAppColorMode() {
    const mode = getColorMode();

    const appearance = computed<AppAppearance>({
        get: () => (mode.store.value === 'auto' ? 'system' : mode.store.value === 'dark' ? 'dark' : 'light'),
        set: (value) => {
            mode.store.value = value === 'system' ? 'auto' : value;
        },
    });

    const resolvedAppearance = computed(() => mode.state.value);

    function setAppearance(value: AppAppearance) {
        appearance.value = value;
    }

    return {
        appearance,
        isDark: computed(() => resolvedAppearance.value === 'dark'),
        resolvedAppearance,
        setAppearance,
    };
}
