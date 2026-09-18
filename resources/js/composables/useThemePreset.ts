import { useAppColorMode } from '@/composables/useAppColorMode';
import {
    DEFAULT_THEME_PRESET_ID,
    getThemeColorRoles,
    getThemeDefaults,
    getThemePalette,
    getThemePreset,
    getThemeUi,
    isThemePresetId,
    THEME_PRESET_STORAGE_KEY,
    themePresetOptions,
    themePresets,
    themeShades,
    type ThemeColorRole,
    type ThemeMode,
    type ThemePreset,
    type ThemePresetId,
} from '@/theme/presets';
import { useStorage } from '@vueuse/core';
import type { RemovableRef } from '@vueuse/shared';
import { computed, watch } from 'vue';

const defaultFont = 'Public Sans';
const defaultMonoFont = 'Geist Mono';
const colorRoles: ThemeColorRole[] = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'];
const semanticRoles: Exclude<ThemeColorRole, 'neutral'>[] = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

let presetId: RemovableRef<ThemePresetId> | null = null;
let initialized = false;

function getPresetId() {
    presetId ??= useStorage<ThemePresetId>(THEME_PRESET_STORAGE_KEY, DEFAULT_THEME_PRESET_ID);

    if (!isThemePresetId(presetId.value)) {
        presetId.value = DEFAULT_THEME_PRESET_ID;
    }

    return presetId;
}

function setRootProperty(name: string, value: string | number) {
    document.documentElement.style.setProperty(name, String(value));
}

function tokenRole(name: string): ThemeColorRole {
    for (const role of semanticRoles) {
        if (name === `--ui-${role}` || name.startsWith(`--ui-color-${role}-`)) {
            return role;
        }
    }

    return 'neutral';
}

function applyPalette(preset: ThemePreset) {
    const roles = getThemeColorRoles(preset);

    for (const role of colorRoles) {
        const palette = getThemePalette(preset, roles[role]);
        const primitiveRole = role === 'error' ? 'danger' : role;

        for (const shade of themeShades) {
            const value = palette[shade];
            setRootProperty(`--ui-color-${role}-${shade}`, value);
            setRootProperty(`--${primitiveRole}-${shade}`, value);
        }
    }
}

function applySemanticTokens(preset: ThemePreset, mode: ThemeMode) {
    const dark = mode === 'dark';
    const semanticShade = dark ? 400 : 500;
    const neutral = (shade: number) => `var(--ui-color-neutral-${shade})`;

    for (const role of semanticRoles) {
        setRootProperty(`--ui-${role}`, `var(--ui-color-${role}-${semanticShade})`);
    }

    setRootProperty('--ui-text-dimmed', neutral(dark ? 500 : 400));
    setRootProperty('--ui-text-muted', neutral(dark ? 400 : 500));
    setRootProperty('--ui-text-toned', neutral(dark ? 300 : 600));
    setRootProperty('--ui-text', neutral(dark ? 200 : 700));
    setRootProperty('--ui-text-highlighted', dark ? '#fff' : neutral(900));
    setRootProperty('--ui-text-inverted', dark ? neutral(950) : '#fff');
    setRootProperty('--ui-bg', dark ? neutral(950) : '#fff');
    setRootProperty('--ui-bg-muted', neutral(dark ? 900 : 50));
    setRootProperty('--ui-bg-elevated', neutral(dark ? 800 : 100));
    setRootProperty('--ui-bg-accented', neutral(dark ? 700 : 200));
    setRootProperty('--ui-bg-inverted', dark ? '#fff' : neutral(900));
    setRootProperty('--ui-border', neutral(dark ? 800 : 200));
    setRootProperty('--ui-border-muted', neutral(dark ? 800 : 200));
    setRootProperty('--ui-border-accented', neutral(dark ? 700 : 300));
    setRootProperty('--ui-border-inverted', dark ? '#fff' : neutral(900));
    setRootProperty('--ui-border-focus', `color-mix(in oklab, var(--ui-color-primary-${semanticShade}) 65%, white)`);

    const tokenShades = preset.style?.tokenShades;
    for (const [name, shades] of Object.entries(tokenShades ?? {})) {
        if (!shades) continue;
        const shade = shades[mode];
        if (shade === undefined) continue;

        setRootProperty(name, `var(--ui-color-${tokenRole(name)}-${shade})`);
    }

    for (const [name, value] of Object.entries(preset.tokens?.[mode] ?? {})) {
        if (value === undefined) continue;

        setRootProperty(name, value);
    }

    if (preset.blackAsPrimary) {
        setRootProperty('--ui-primary', dark ? neutral(50) : neutral(950));
        setRootProperty('--ui-border-focus', `color-mix(in oklab, ${neutral(dark ? 50 : 950)} 65%, transparent)`);
    }
}

function applyTypography(preset: ThemePreset) {
    const font = preset.font;
    const sans = font?.sans ?? defaultFont;
    const serif = font?.serif ?? 'Source Serif 4';
    const mono = font?.mono ?? defaultMonoFont;
    const family = (name: string) => `'${name}', ui-sans-serif, system-ui, sans-serif`;

    setRootProperty('--default-font-family', family(sans));
    setRootProperty('--font-sans', family(sans));
    setRootProperty('--font-serif', `'${serif}', ui-serif, Georgia, serif`);
    setRootProperty('--font-mono', `'${mono}', ui-monospace, SFMono-Regular, monospace`);
    setRootProperty('--heading-font-family', font?.heading === 'serif' ? family(serif) : font?.heading === 'sans' ? family(sans) : 'inherit');
    setRootProperty('--default-line-height', font?.lineHeight ?? 1.5);
    setRootProperty('--default-letter-spacing', font?.letterSpacing ? `${font.letterSpacing}em` : 'normal');

    const weights = { normal: 400, medium: 500, semibold: 600, bold: 700, ...font?.weights };
    for (const [name, weight] of Object.entries(weights)) {
        setRootProperty(`--font-weight-${name}`, weight);
    }

    document.documentElement.style.fontSize = `${preset.fontSize ?? 16}px`;
}

function applyShape(preset: ThemePreset) {
    const radius = `${preset.radius ?? 0.25}rem`;

    setRootProperty('--ui-radius', radius);
    setRootProperty('--radius', radius);
    setRootProperty('--radius-xs', radius);
    setRootProperty('--radius-sm', radius);
    setRootProperty('--radius-md', radius);
    setRootProperty('--radius-lg', radius);
    setRootProperty('--radius-xl', radius);
}

function fontLinkUrl(preset: ThemePreset) {
    const fonts = new Set([defaultFont, defaultMonoFont, preset.font?.sans, preset.font?.serif, preset.font?.mono].filter(Boolean) as string[]);
    const families = [...fonts].map((font) => `family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@400;500;600;700;800`);
    return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

function applyFonts(preset: ThemePreset) {
    const id = 'cms-theme-preset-fonts';
    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    const href = fontLinkUrl(preset);
    if (link.href !== href) {
        link.href = href;
    }
}

function applyPreset(preset: ThemePreset, mode: ThemeMode) {
    if (typeof document === 'undefined') return;

    document.documentElement.dataset.themePreset = preset.id;
    applyPalette(preset);
    applySemanticTokens(preset, mode);
    applyShape(preset);
    applyTypography(preset);
    applyFonts(preset);
}

export function useThemePreset() {
    const selectedPresetId = getPresetId();
    const colorMode = useAppColorMode();
    const activePreset = computed(() => getThemePreset(selectedPresetId.value));
    const activePresetDescription = computed(() => activePreset.value.description);
    const themeDefaults = computed(() => getThemeDefaults(activePreset.value));
    const themeUi = computed(() => getThemeUi(activePreset.value));

    if (!initialized) {
        initialized = true;
        watch(
            [activePreset, colorMode.resolvedAppearance],
            ([preset, appearance]) => {
                applyPreset(preset, appearance === 'dark' ? 'dark' : 'light');
            },
            { immediate: true },
        );
    }

    function setPreset(value: ThemePresetId) {
        selectedPresetId.value = isThemePresetId(value) ? value : DEFAULT_THEME_PRESET_ID;
    }

    return {
        activePreset,
        activePresetDescription,
        selectedPresetId,
        setPreset,
        themeDefaults,
        themePresetOptions,
        themePresets,
        themeUi,
    };
}
