import { UserPreferences, UserSecurityPayload } from '@/features/users/users.types';

export function useAccount() {
    const updateUserProfile = async (payload: FormData) => {};

    const updateUserSecurity = async (payload: UserSecurityPayload) => {};
    const updateUserPreferences = async (payload: UserPreferences) => {};

    return { updateUserProfile, updateUserSecurity, updateUserPreferences };
}
