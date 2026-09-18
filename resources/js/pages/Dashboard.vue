<script setup lang="ts">
import { AppPageHeader } from '@/components/ui';
import AppContent from '@/layouts/app/components/AppContent.vue';
import { computed } from 'vue';

import { useAuthStore } from '@/features/auth/auth.store';

const auth = useAuthStore();

const firstName = computed(() => auth.user?.name?.trim().split(/\s+/)[0] || 'there');

const quickLinks = [
    { label: 'Manage posts', description: 'Create and organize your content.', icon: 'i-lucide-file-text', to: '/dashboard/posts' },
    { label: 'Manage pages', description: 'Update your site pages and categories.', icon: 'i-lucide-files', to: '/dashboard/pages' },
    { label: 'Media library', description: 'Browse and upload reusable media.', icon: 'i-lucide-images', to: '/dashboard/media' },
    { label: 'Account settings', description: 'Update your profile and preferences.', icon: 'i-lucide-settings-2', to: '/dashboard/account/profile' },
];
</script>

<template>
    <AppContent>
        <AppPageHeader title="Dashboard" description="Manage your content and site settings from one place." />

        <section class="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)]">
            <UCard variant="subtle" :ui="{ body: 'p-6 sm:p-8' }">
                <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div class="max-w-xl">
                        <p class="text-primary text-sm font-medium">Welcome back, {{ firstName }}</p>
                        <h2 class="text-highlighted mt-2 text-2xl font-semibold">Keep your site moving forward.</h2>
                        <p class="text-muted mt-2 text-sm leading-6">Use the shortcuts here to jump into the areas you work with most often.</p>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <AppButton to="/dashboard/posts/create" icon="i-lucide-plus">Create post</AppButton>
                        <AppButton to="/dashboard/media" color="neutral" variant="outline">Browse media</AppButton>
                    </div>
                </div>
            </UCard>

            <UCard variant="subtle" :ui="{ body: 'p-6' }">
                <div class="mb-4">
                    <h2 class="text-highlighted text-base font-semibold">Quick access</h2>
                    <p class="text-muted mt-1 text-sm">Common areas of your CMS.</p>
                </div>

                <nav class="grid gap-1" aria-label="Quick access">
                    <router-link
                        v-for="link in quickLinks"
                        :key="link.to"
                        :to="link.to"
                        class="group hover:bg-elevated/50 focus-visible:outline-primary flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <span class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                            <UIcon :name="link.icon" class="size-4" />
                        </span>
                        <span class="min-w-0">
                            <span class="text-highlighted block truncate text-sm font-medium">{{ link.label }}</span>
                            <span class="text-muted block truncate text-xs">{{ link.description }}</span>
                        </span>
                        <UIcon name="i-lucide-chevron-right" class="text-dimmed ms-auto size-4 transition-transform group-hover:translate-x-0.5" />
                    </router-link>
                </nav>
            </UCard>
        </section>
    </AppContent>
</template>
