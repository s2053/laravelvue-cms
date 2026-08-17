<template>
    <form class="app-form" @submit.prevent="onSubmit">
        <div class="app-form-field">
            <label for="role-name" class="app-form-label">Role name:</label>
            <AppInput id="role-name" v-model="form.name" name="name" placeholder="Role name" class="w-full" />
            <AppFieldError :formError="clientErrors.name" :serverError="serverErrors?.name?.[0]" />

            <div class="mt-3 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <label for="role-slug" class="font-semibold whitespace-nowrap text-[var(--color-text)]">Slug:</label>
                <span v-if="!slugEdit" :title="form.slug" class="min-w-0 flex-1 truncate">
                    {{ form.slug }}
                </span>
                <AppInput
                    v-else
                    id="role-slug"
                    v-model="form.slug"
                    name="slug"
                    placeholder="Slug"
                    size="sm"
                    class="min-w-0 flex-1"
                    @input="onSlugInput"
                />
                <AppButton
                    type="button"
                    :color="slugEdit ? 'success' : 'neutral'"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-pencil"
                    :title="slugEdit ? 'Finish editing slug' : 'Edit slug'"
                    @click="slugEdit = !slugEdit"
                />
            </div>

            <AppFieldError :formError="clientErrors.slug" :serverError="serverErrors?.slug?.[0]" />
        </div>

        <div class="app-form-field">
            <div class="flex items-center justify-between gap-3">
                <span class="app-form-label">Permissions:</span>
                <AppCheckbox
                    :modelValue="areAllPermissionsSelected"
                    :indeterminate="areSomePermissionsSelected"
                    label="Select All"
                    @update:model-value="toggleAllPermissions"
                />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <section v-for="group in groups" :key="group.id" class="rounded-md border border-[var(--color-border)] p-3">
                    <AppCheckbox
                        :modelValue="isGroupFullySelected(group)"
                        :indeterminate="isGroupPartiallySelected(group)"
                        :label="group.name"
                        @update:model-value="toggleGroup(group)"
                    />

                    <div class="mt-2 space-y-2 pl-6">
                        <AppCheckbox
                            v-for="permission in group.permissions ?? []"
                            :key="permission.id"
                            v-model="form.permissions"
                            :value="permission.id"
                            :label="permission.name"
                        />
                    </div>
                </section>
            </div>

            <AppFieldError :formError="clientErrors.permissions" :serverError="serverErrors?.permissions?.[0]" />
        </div>

        <div class="app-form-actions">
            <AppButton type="button" color="neutral" variant="outline" @click="emit('cancel')">Cancel</AppButton>
            <AppButton type="submit">{{ submitLabel }}</AppButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { AppButton, AppCheckbox, AppFieldError, AppInput } from '@/components/ui';
import type { Permission, PermissionGroup, RolePayload } from '@/features/rbac/rbac.types';
import { slugify } from '@/utils/slugify';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    initialForm: RolePayload;
    submitLabel: string;
    serverErrors?: Record<string, string[]>;
    groups: PermissionGroup[];
    editingId: number | null;
}>();
const emit = defineEmits(['submit', 'cancel']);
const isEditMode = computed(() => props.editingId !== null);

const slugEdit = ref(false);
const form = ref({ ...props.initialForm });
const clientErrors = ref<Record<string, string>>({});

watch(
    () => props.initialForm,
    (val) => {
        form.value = { ...val };
        clientErrors.value = {};
    },
    { immediate: true },
);

watch(
    () => form.value.name,
    (newTitle) => {
        if (!isEditMode.value) {
            form.value.slug = slugify(newTitle);
        }
    },
);

const schema = z.object({
    name: z.string().min(1, { message: 'Role name is required.' }),
    permissions: z.array(z.number()).min(1, { message: 'Select at least one permission.' }),
});

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

function toggleAllPermissions(value: boolean | unknown[] | 'indeterminate') {
    if (value === 'indeterminate') return;

    if (areAllPermissionsSelected.value) {
        form.value.permissions = [];
    } else {
        form.value.permissions = [...allPermissionIds.value];
    }
}

function onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement;
    form.value.slug = slugify(input.value);
}

function onSubmit() {
    const parsed = schema.safeParse(form.value);

    if (!parsed.success) {
        clientErrors.value = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
        return;
    }

    clientErrors.value = {};
    emit('submit', { ...form.value });
}
</script>
