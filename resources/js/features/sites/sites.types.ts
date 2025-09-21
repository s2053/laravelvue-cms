export interface SocialLinks {
    [key: string]: string; // e.g., { facebook: "https://...", twitter: "https://..." }
}

export interface SiteInfo {
    site_title?: string | null;
    tagline?: string | null;

    logo?: string | null;
    footer_logo?: string | null;
    favicon?: string | null;
    placeholder_image?: string | null;

    contact_email?: string | null;
    contact_phone?: string | null;
    contact_mobile?: string | null;
    address?: string | null;
    google_map_iframe?: string | null;

    social_links?: SocialLinks | null;

    meta_title?: string | null;
    meta_description?: string | null;

    cookies_enabled: boolean;
    cookies_text?: string | null;
    copyright_text?: string | null;
}

export type SiteInfoPayload = SiteInfo & {
    logo_file?: File | null;
    footer_logo_file?: File | null;
    favicon_file?: File | null;
    placeholder_image_file?: File | null;
};
