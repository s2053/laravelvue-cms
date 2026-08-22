<template>
    <div class="h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div class="flex h-screen overflow-hidden">
            <slot name="sidebar" />
            <main class="min-w-0 flex-1 overflow-y-auto">
                <slot />
            </main>
        </div>
    </div>
</template>
