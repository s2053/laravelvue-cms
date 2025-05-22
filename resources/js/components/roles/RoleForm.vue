<template>
    <Form v-slot="$form" :initialValues="roleForm" :resolver="resolver" @submit="onSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <label for="name" class="mb-2 block font-bold">Role name:</label>
            <InputText v-model="roleForm.name" name="name" type="text" placeholder="name" />
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.name" severity="error" size="small" variant="simple">
                {{ serverErrors.name[0] }}
            </Message>
        </div>

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
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div v-for="group in groups" :key="group.id" class="mb-2">
                    <div class="flex items-center gap-2 font-semibold">
                        <label style="cursor: pointer">
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
                                <Checkbox :value="perm.id" v-model="roleForm.permissions" />
                                {{ perm.name }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <Message v-if="$form.permissions?.invalid" severity="error" size="small" variant="simple">
                {{ $form.permissions.error.message }}
            </Message>
            <Message v-else-if="serverErrors?.permissions" severity="error" size="small" variant="simple">
                {{ serverErrors.permissions[0] }}
            </Message>
        </div>

        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')" />
            <Button type="submit" :label="submitLabel" severity="secondary"></Button>
        </div>
    </Form>
</template>

<script setup lang="ts">
import type { Permission, PermissionGroup } from '@/types/rbac';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Checkbox from 'primevue/checkbox';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    modelValue: { name?: string | null; permissions?: number[] };
    submitLabel: string;
    serverErrors?: { [key: string]: string[] };
    groups: PermissionGroup[];
}>();

const emit = defineEmits(['submit', 'cancel']);

const roleForm = ref({
    name: props.modelValue.name ?? '',
    permissions: props.modelValue.permissions ?? [],
});

watch(
    () => props.modelValue,
    (val) =>
        (roleForm.value = {
            name: val.name ?? '',
            permissions: val.permissions ?? [],
        }),
);

const resolver = zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Role name is required.' }),
        permissions: z.array(z.number()).min(1, { message: 'Select at least one permission.' }),
    }),
);

function isGroupFullySelected(group: PermissionGroup) {
    const perms = group.permissions ?? [];
    return perms.length > 0 && perms.every((perm: Permission) => roleForm.value.permissions.includes(perm.id));
}

function isGroupPartiallySelected(group: PermissionGroup) {
    const perms = group.permissions ?? [];
    const selected = perms.filter((perm: Permission) => roleForm.value.permissions.includes(perm.id));
    return selected.length > 0 && selected.length < perms.length;
}

function toggleGroup(group: PermissionGroup) {
    const perms = group.permissions ?? [];
    const allIds = perms.map((perm: Permission) => perm.id);
    if (isGroupFullySelected(group)) {
        roleForm.value.permissions = roleForm.value.permissions.filter((id: number) => !allIds.includes(id));
    } else {
        roleForm.value.permissions = Array.from(new Set([...roleForm.value.permissions, ...allIds]));
    }
}
const allPermissionIds = computed(() => props.groups.flatMap((group) => (group.permissions ?? []).map((perm) => perm.id)));
const areAllPermissionsSelected = computed(
    () => allPermissionIds.value.length > 0 && allPermissionIds.value.every((id) => roleForm.value.permissions.includes(id)),
);

const areSomePermissionsSelected = computed(() => {
    const selected = allPermissionIds.value.filter((id) => roleForm.value.permissions.includes(id));
    return selected.length > 0 && selected.length < allPermissionIds.value.length;
});

function toggleAllPermissions() {
    if (areAllPermissionsSelected.value) {
        // Deselect all
        roleForm.value.permissions = [];
    } else {
        // Select all
        roleForm.value.permissions = [...allPermissionIds.value];
    }
}

function onSubmit({ valid }: { valid: boolean }) {
    if (valid) {
        emit('submit', roleForm.value);
    }
}
</script>
