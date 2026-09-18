<template>
    <UTheme :props="themeDefaults" :ui="themeUi">
        <UApp :toaster="{ position: 'top-right' }">
            <router-view />
        </UApp>
    </UTheme>
</template>

<script setup lang="ts">
import { usePreferencesSync } from '@/composables/usePreferences';
import { useThemePreset } from '@/composables/useThemePreset';
import { useAuthStore } from '@/features/auth/auth.store';

import { onMounted } from 'vue';
const auth = useAuthStore();

usePreferencesSync();
const { themeDefaults, themeUi } = useThemePreset();

onMounted(() => {
    void auth.fetchUser().catch(() => undefined);
});
</script>
