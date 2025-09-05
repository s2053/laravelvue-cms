<template>
    <Form v-slot="$form" :initialValues="form" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <!-- Role Name -->
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Role name:</label>
            <InputText v-model="form.name" name="name" type="text" placeholder="Role name" class="w-full" />
            <FieldError :formError="$form.name?.error?.message" :serverError="serverErrors?.name?.[0]" />
        </div>

        <!-- Permissions -->
        <div class="flex flex-col gap-1">
            <div class="mb-2 flex items-center justify-between">
                <label class="font-bold">Permissions:</label>
                <label class="flex cursor-pointer items-center gap-1">
                    <Checkbox
                        :binary="true"
                        :modelValue="areAllPermissionsSelected"
                        :indeterminate="areSomePermissionsSelected"
                        @change="toggleAllPermissions"
                    />
                    Select All
                </label>
            </div>

            <!-- Permission groups -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="group in groups" :key="group.id" class="mb-2">
                    <div class="flex items-center gap-2 font-semibold">
                        <label class="cursor-pointer">
                            <Checkbox
                                :binary="true"
                                :modelValue="isGroupFullySelected(group)"
                                :indeterminate="isGroupPartiallySelected(group)"
                                @change.stop="toggleGroup(group)"
                            />
                            {{ group.name }}
                        </label>
                    </div>
                    <div class="ml-6">
                        <div v-for="perm in group.permissions ?? []" :key="perm.id" class="mt-1">
                            <label>
                                <Checkbox :value="perm.id" v-model="form.permissions" />
                                {{ perm.name }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <FieldError :formError="$form.permissions?.error?.message" :serverError="serverErrors?.permissions?.[0]" />
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="primary" />
        </div>
    </Form>
</template>

<script setup lang="ts">
import FieldError from '@/components/common/FieldError.vue';
import type { Permission, PermissionGroup, RolePayload } from '@/features/rbac/rbac.types';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Checkbox from 'primevue/checkbox';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

// Props & emits
const props = defineProps<{
    initialForm: RolePayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    groups: PermissionGroup[];
}>();
const emit = defineEmits(['submit', 'cancel']);

// Reactive form
const form = ref({ ...props.initialForm });

// Keep in sync with props
watch(
    () => props.initialForm,
    (val) => {
        form.value = { ...val };
    },
    { immediate: true },
);

// Validation
const resolver = zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Role name is required.' }),
        permissions: z.array(z.number()).min(1, { message: 'Select at least one permission.' }),
    }),
);

// === Permission selection helpers ===
function isGroupFullySelected(group: PermissionGroup) {
    const perms = Array.isArray(group.permissions) ? group.permissions : [];
    return perms.length > 0 && perms.every((perm: Permission) => form.value.permissions.includes(perm.id));
}

function isGroupPartiallySelected(group: PermissionGroup) {
    const perms = Array.isArray(group.permissions) ? group.permissions : [];
    const selected = perms.filter((perm: Permission) => form.value.permissions.includes(perm.id));
    return selected.length > 0 && selected.length < perms.length;
}

function toggleGroup(group: PermissionGroup) {
    const perms = Array.isArray(group.permissions) ? group.permissions : [];
    const allIds = perms.map((perm: Permission) => perm.id);
    if (isGroupFullySelected(group)) {
        form.value.permissions = form.value.permissions.filter((id) => !allIds.includes(id));
    } else {
        form.value.permissions = Array.from(new Set([...form.value.permissions, ...allIds]));
    }
}

const allPermissionIds = computed(() => props.groups.flatMap((g) => (Array.isArray(g.permissions) ? g.permissions.map((p) => p.id) : [])));
const areAllPermissionsSelected = computed(
    () => allPermissionIds.value.length > 0 && allPermissionIds.value.every((id) => form.value.permissions.includes(id)),
);
const areSomePermissionsSelected = computed(() => {
    const selected = allPermissionIds.value.filter((id) => form.value.permissions.includes(id));
    return selected.length > 0 && selected.length < allPermissionIds.value.length;
});

function toggleAllPermissions() {
    if (areAllPermissionsSelected.value) {
        form.value.permissions = [];
    } else {
        form.value.permissions = [...allPermissionIds.value];
    }
}

// Submit
function onSubmit({ valid }: { valid: boolean }) {
    if (valid) emit('submit', form.value);
}
</script>
