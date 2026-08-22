<template>
    <UApp :toaster="{ position: 'top-right' }">
        <router-view />
    </UApp>
</template>

<script setup lang="ts">
import { usePreferencesSync } from '@/composables/usePreferences';
import { useAuthStore } from '@/features/auth/auth.store';

import { onMounted } from 'vue';
onMounted(() => {
    const auth = useAuthStore();
    auth.fetchUser();
});
usePreferencesSync();
</script>
