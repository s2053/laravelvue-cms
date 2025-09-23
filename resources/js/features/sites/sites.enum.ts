export enum SocialPlatform {
    FACEBOOK = 'facebook',
    TWITTER = 'twitter',
    INSTAGRAM = 'instagram',
    LINKEDIN = 'linkedin',
    YOUTUBE = 'youtube',
}

export const SocialPlatformOptions = [
    { label: 'Facebook', value: SocialPlatform.FACEBOOK, icon: 'pi pi-facebook text-blue-600' },
    { label: 'Twitter (X)', value: SocialPlatform.TWITTER, icon: 'pi pi-twitter text-sky-500' },
    { label: 'Instagram', value: SocialPlatform.INSTAGRAM, icon: 'pi pi-instagram text-pink-500' },
    { label: 'LinkedIn', value: SocialPlatform.LINKEDIN, icon: 'pi pi-linkedin text-blue-700' },
    { label: 'YouTube', value: SocialPlatform.YOUTUBE, icon: 'pi pi-youtube text-red-600' },
];
