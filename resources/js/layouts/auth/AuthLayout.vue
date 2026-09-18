<template>
    <div class="flex min-h-screen items-center justify-center px-4">
        <router-view v-slot="{ Component, route }">
            <transition mode="out-in">
                <component :is="Component" :key="route.path" />
            </transition>
        </router-view>
    </div>
</template>
