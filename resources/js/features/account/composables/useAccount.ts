import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import AccountService from '@/features/account/services/account.service';
import type { User, UserPreferences, UserSecurityPayload } from '@/features/users/users.types';
import { ref } from 'vue';

export function useAccount() {
    const { handleError } = useApiErrorHandler();

    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Update profile (name, email)
    const updateProfile = async (payload: FormData) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await AccountService.updateProfile(payload);
            user.value = res.data; // update store/local state
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update profile';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Update security/password
    const updateSecurity = async (payload: UserSecurityPayload) => {
        loading.value = true;
        error.value = null;
        try {
            await AccountService.updateSecurity(payload);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update security settings';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Update preferences (theme, notifications, etc.)
    const updatePreferences = async (payload: UserPreferences) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await AccountService.updatePreferences(payload);
            user.value = res.data; // update state with new preferences
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update preferences';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        user,
        loading,
        error,
        updateProfile,
        updateSecurity,
        updatePreferences,
    };
}
