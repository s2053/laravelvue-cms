<template>
    <UCard
        :ui="{
            root: 'rounded-xl',
            header: 'p-5',
            body: 'p-5',
            footer: 'p-5',
        }"
    >
        <template v-if="$slots.header" #header>
            <slot name="header" />
        </template>

        <slot />

        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </UCard>
</template>
