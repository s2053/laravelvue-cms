<template>
    <router-view></router-view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/features/auth/auth.store';
import { onMounted } from 'vue';
onMounted(() => {
    const auth = useAuthStore();
    auth.fetchUser();
});
</script>
