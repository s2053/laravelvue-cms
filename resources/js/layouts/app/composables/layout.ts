import { computed, reactive } from 'vue';

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    staticMenuMobileActive: false,
});

export function useLayout() {
    const toggleMenu = () => {
        if (window.innerWidth >= 1024) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const isSidebarActive = computed(() => layoutState.staticMenuMobileActive);

    return {
        layoutState,
        toggleMenu,
        isSidebarActive,
    };
}
