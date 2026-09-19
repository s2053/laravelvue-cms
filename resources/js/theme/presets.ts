import colors from 'tailwindcss/colors';

export const THEME_PRESET_STORAGE_KEY = 'theme-preset';
export const DEFAULT_THEME_PRESET_ID = 'default';

export const themeShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ThemeShade = (typeof themeShades)[number];
export type ThemeMode = 'light' | 'dark';
export type ThemeColorRole = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';

type ThemePalette = Record<ThemeShade, string>;
type ThemeTokenShades = Partial<Record<string, Partial<Record<ThemeMode, ThemeShade>>>>;
type ThemeTokenValues = Partial<Record<ThemeMode, Partial<Record<string, string>>>>;

export interface ThemeFontSettings {
    sans?: string;
    serif?: string;
    mono?: string;
    heading?: 'sans' | 'serif';
    lineHeight?: number;
    letterSpacing?: number;
    weights?: Partial<Record<'normal' | 'medium' | 'semibold' | 'bold', number>>;
}

export interface ThemePresetDefaults {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    colors?: { inputs?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' };
    variants?: {
        buttons?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
        inputs?: 'outline' | 'soft' | 'subtle' | 'none';
        panels?: 'outline' | 'subtle';
    };
}

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    colors?: Partial<Record<ThemeColorRole, string>>;
    palettes?: Partial<Record<string, ThemePalette>>;
    radius?: number;
    font?: ThemeFontSettings;
    fontSize?: number;
    blackAsPrimary?: boolean;
    style?: {
        defaults?: ThemePresetDefaults;
        tokenShades?: ThemeTokenShades;
    };
    tokens?: ThemeTokenValues;
    components?: {
        roundedControls?: boolean;
        elevatedCards?: boolean;
        glowingButtons?: boolean;
    };
}

type ThemeButtonVariant = 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
type ThemeInputVariant = 'outline' | 'soft' | 'subtle' | 'none';
type ThemeComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ThemeComponentColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';
interface ThemeComponentDefaults {
    color: ThemeComponentColor;
    variant: ThemeInputVariant;
    size: ThemeComponentSize;
}

const tailwindPalettes = colors as unknown as Record<string, Partial<ThemePalette>>;

export const themePresets = [
    {
        id: 'default',
        name: 'Default',
        description: 'The default theme.',
    },
    {
        id: 'mono',
        name: 'Mono',
        description: 'Black on a pure gray neutral, generous radius, quiet surfaces.',
        blackAsPrimary: true,
        colors: { neutral: 'neutral' },
        radius: 0.5,
        font: { sans: 'Geist', mono: 'Geist Mono' },
        style: {
            defaults: { variants: { inputs: 'subtle' } },
            tokenShades: {
                '--ui-bg': { dark: 950 },
                '--ui-bg-muted': { light: 100, dark: 900 },
                '--ui-bg-elevated': { light: 100, dark: 900 },
                '--ui-bg-accented': { light: 200, dark: 800 },
                '--ui-text': { light: 900, dark: 100 },
                '--ui-text-highlighted': { light: 950, dark: 50 },
            },
        },
    },
    {
        id: 'editorial',
        name: 'Editorial',
        description: 'Black and zinc with expressive display headings, compact corners, and restrained surfaces.',
        colors: { neutral: 'zinc' },
        radius: 0.125,
        font: { sans: 'Bricolage Grotesque', serif: 'Source Serif 4', heading: 'serif' },
        tokens: {
            light: {
                '--ui-primary': 'black',
                '--ui-bg': 'var(--ui-color-neutral-50)',
                '--ui-bg-muted': 'var(--ui-color-neutral-100)',
                '--ui-text-inverted': 'var(--ui-color-neutral-50)',
            },
            dark: {
                '--ui-primary': 'white',
                '--ui-text-highlighted': 'var(--ui-color-neutral-50)',
                '--ui-bg-inverted': 'var(--ui-color-neutral-50)',
                '--ui-border-inverted': 'var(--ui-color-neutral-50)',
                '--ui-bg': 'var(--ui-color-neutral-900)',
                '--ui-bg-muted': 'var(--ui-color-neutral-800)',
                '--ui-text-inverted': 'var(--ui-color-neutral-900)',
            },
        },
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'A restrained neutral interface with crisp surfaces, quiet borders, and balanced contrast.',
        blackAsPrimary: true,
        colors: { neutral: 'zinc' },
        radius: 0.5,
        font: { sans: 'Inter' },
        tokens: {
            light: {
                '--ui-bg': '#fff',
                '--ui-bg-muted': 'var(--ui-color-neutral-50)',
                '--ui-bg-elevated': '#fff',
                '--ui-bg-accented': 'var(--ui-color-neutral-100)',
                '--ui-text': 'var(--ui-color-neutral-950)',
                '--ui-text-highlighted': 'var(--ui-color-neutral-950)',
                '--ui-text-toned': 'var(--ui-color-neutral-700)',
                '--ui-text-muted': 'var(--ui-color-neutral-600)',
                '--ui-text-dimmed': 'var(--ui-color-neutral-500)',
                '--ui-text-inverted': 'var(--ui-color-neutral-50)',
                '--ui-border': 'var(--ui-color-neutral-200)',
                '--ui-border-muted': 'var(--ui-color-neutral-200)',
                '--ui-border-accented': 'var(--ui-color-neutral-300)',
            },
            dark: {
                '--ui-bg': 'var(--ui-color-neutral-950)',
                '--ui-bg-muted': 'var(--ui-color-neutral-900)',
                '--ui-bg-elevated': 'var(--ui-color-neutral-900)',
                '--ui-bg-accented': 'var(--ui-color-neutral-800)',
                '--ui-text': 'var(--ui-color-neutral-100)',
                '--ui-text-highlighted': 'var(--ui-color-neutral-50)',
                '--ui-text-toned': 'var(--ui-color-neutral-300)',
                '--ui-text-muted': 'var(--ui-color-neutral-400)',
                '--ui-text-dimmed': 'var(--ui-color-neutral-500)',
                '--ui-text-inverted': 'var(--ui-color-neutral-950)',
                '--ui-border': 'var(--ui-color-neutral-800)',
                '--ui-border-muted': 'var(--ui-color-neutral-800)',
                '--ui-border-accented': 'var(--ui-color-neutral-700)',
                '--ui-border-inverted': 'var(--ui-color-neutral-50)',
            },
        },
    },
    {
        id: 'brutal',
        name: 'Brutal',
        description: 'Warm paper surfaces, saturated accents, square corners, and unapologetically crisp contrast.',
        colors: { primary: 'yellow', secondary: 'blue', success: 'green', info: 'cyan', warning: 'orange', error: 'red', neutral: 'stone' },
        radius: 0,
        font: { sans: 'Bricolage Grotesque', weights: { normal: 500, medium: 600, semibold: 700, bold: 800 } },
        style: {
            defaults: { variants: { buttons: 'solid', inputs: 'outline', panels: 'outline' } },
            tokenShades: {
                '--ui-primary': { light: 600, dark: 400 },
                '--ui-bg': { light: 50, dark: 950 },
                '--ui-bg-muted': { light: 100, dark: 900 },
                '--ui-bg-elevated': { light: 50, dark: 900 },
                '--ui-bg-accented': { light: 200, dark: 800 },
                '--ui-bg-inverted': { light: 950, dark: 50 },
                '--ui-text': { light: 950, dark: 50 },
                '--ui-text-highlighted': { light: 950, dark: 50 },
                '--ui-text-muted': { light: 700, dark: 300 },
                '--ui-text-inverted': { light: 50, dark: 950 },
                '--ui-border': { light: 950, dark: 50 },
                '--ui-border-muted': { light: 950, dark: 200 },
                '--ui-border-accented': { light: 950, dark: 50 },
                '--ui-border-inverted': { light: 950, dark: 50 },
            },
        },
    },
    {
        id: 'cobalt',
        name: 'Cobalt',
        description: 'Utility blue on cool grays, tight corners, flat bordered surfaces.',
        palettes: {
            cobalt: {
                50: 'oklch(95.3% 0.022 260.723)',
                100: 'oklch(90.8% 0.045 258.763)',
                200: 'oklch(81.6% 0.091 257.776)',
                300: 'oklch(72.9% 0.14 258.068)',
                400: 'oklch(64.7% 0.186 258.256)',
                500: 'oklch(57.8% 0.228 260.025)',
                600: 'oklch(49.2% 0.19 259.799)',
                700: 'oklch(40.2% 0.152 259.656)',
                800: 'oklch(30.7% 0.109 258.934)',
                900: 'oklch(20.4% 0.063 257.52)',
                950: 'oklch(14.7% 0.037 249.929)',
            },
            'cobalt-gray': {
                50: 'oklch(99.1% 0 0)',
                100: 'oklch(98.2% 0.002 247.839)',
                200: 'oklch(94.2% 0.005 247.879)',
                300: 'oklch(91.1% 0.007 247.901)',
                400: 'oklch(86.7% 0.011 247.949)',
                500: 'oklch(76.9% 0.015 248.017)',
                600: 'oklch(55.8% 0.016 244.893)',
                700: 'oklch(42.8% 0.015 248.172)',
                800: 'oklch(34.5% 0.013 248.212)',
                900: 'oklch(26.2% 0.009 248.19)',
                950: 'oklch(20.7% 0.008 248.192)',
            },
        },
        colors: { primary: 'cobalt', secondary: 'cobalt-gray', info: 'cyan', warning: 'amber', neutral: 'cobalt-gray' },
        radius: 0.125,
        fontSize: 15,
        font: { sans: 'Roboto' },
        style: { defaults: { variants: { inputs: 'subtle' } } },
        tokens: {
            light: {
                '--ui-secondary': 'var(--ui-color-secondary-600)',
                '--ui-bg-muted': 'var(--ui-color-neutral-200)',
                '--ui-text': 'var(--ui-color-neutral-800)',
                '--ui-border': 'var(--ui-color-neutral-400)',
                '--ui-border-muted': 'var(--ui-color-neutral-300)',
                '--ui-bg': 'var(--ui-color-neutral-100)',
                '--ui-text-toned': 'var(--ui-color-neutral-700)',
                '--ui-text-muted': 'var(--ui-color-neutral-600)',
                '--ui-text-dimmed': 'var(--ui-color-neutral-600)',
                '--ui-bg-elevated': 'var(--ui-color-neutral-200)',
                '--ui-bg-accented': 'var(--ui-color-neutral-300)',
            },
            dark: {
                '--ui-primary': 'var(--ui-color-primary-500)',
                '--ui-secondary': 'var(--ui-color-secondary-500)',
                '--ui-success': 'var(--ui-color-success-500)',
                '--ui-info': 'var(--ui-color-info-500)',
                '--ui-warning': 'var(--ui-color-warning-500)',
                '--ui-error': 'var(--ui-color-error-500)',
                '--ui-bg-muted': 'var(--ui-color-neutral-700)',
                '--ui-text': 'var(--ui-color-neutral-300)',
            },
        },
    },
    {
        id: 'sky',
        name: 'Sky',
        description: 'Sky blue on a mist neutral, pastel fills everywhere, airy type.',
        colors: { primary: 'sky', neutral: 'mist' },
        radius: 0.75,
        font: { sans: 'Figtree', lineHeight: 1.6 },
        style: {
            defaults: { variants: { buttons: 'soft', inputs: 'soft' } },
            tokenShades: {
                '--ui-bg': { light: 50 },
                '--ui-bg-muted': { light: 100 },
                '--ui-text-inverted': { light: 50 },
                '--ui-text-highlighted': { dark: 50 },
                '--ui-bg-inverted': { dark: 50 },
                '--ui-border-inverted': { dark: 50 },
            },
        },
    },
    {
        id: 'mint',
        name: 'Mint',
        description: 'Teal on an olive neutral, pill controls, and a softer rounded rhythm.',
        colors: { primary: 'teal', neutral: 'olive' },
        radius: 0.75,
        font: { sans: 'Nunito', weights: { normal: 500, medium: 600, semibold: 700, bold: 800 } },
        style: { defaults: { size: 'lg', variants: { inputs: 'soft' } } },
        components: { roundedControls: true },
    },
    {
        id: 'iris',
        name: 'Iris',
        description: 'Violet outlines on a mauve neutral, fuchsia secondary, tinted fields.',
        colors: { primary: 'violet', secondary: 'fuchsia', neutral: 'mauve' },
        radius: 0.5,
        font: { sans: 'Manrope', letterSpacing: -0.01 },
        style: {
            defaults: { variants: { buttons: 'outline', inputs: 'subtle' } },
            tokenShades: {
                '--ui-bg': { light: 50 },
                '--ui-bg-muted': { light: 100 },
                '--ui-text-inverted': { light: 50 },
                '--ui-text-highlighted': { dark: 50 },
                '--ui-bg-inverted': { dark: 50 },
                '--ui-border-inverted': { dark: 50 },
            },
        },
    },
    {
        id: 'crimson',
        name: 'Crimson',
        description: 'Cinema red on pure gray, square corners, filled fields.',
        colors: { primary: 'red', neutral: 'neutral' },
        radius: 0,
        font: { sans: 'Inter', weights: { semibold: 700, bold: 800 } },
        style: {
            defaults: { variants: { inputs: 'soft' } },
            tokenShades: {
                '--ui-text-inverted': { light: 50 },
                '--ui-text-highlighted': { dark: 50 },
                '--ui-bg-inverted': { dark: 50 },
                '--ui-border-inverted': { dark: 50 },
                '--ui-primary': { light: 600, dark: 500 },
                '--ui-bg': { light: 50, dark: 950 },
                '--ui-bg-muted': { light: 100, dark: 900 },
                '--ui-bg-elevated': { dark: 900 },
                '--ui-bg-accented': { dark: 800 },
            },
        },
    },
    {
        id: 'coral',
        name: 'Coral',
        description: 'Rose on warm stone, floating cards, teal success, neutral focus rings.',
        colors: { primary: 'rose', success: 'teal', neutral: 'stone' },
        radius: 0.5,
        font: { sans: 'Plus Jakarta Sans' },
        style: {
            defaults: { colors: { inputs: 'neutral' } },
            tokenShades: {
                '--ui-bg': { light: 50 },
                '--ui-bg-muted': { light: 100 },
                '--ui-text-inverted': { light: 50 },
                '--ui-text-highlighted': { dark: 50 },
                '--ui-bg-inverted': { dark: 50 },
                '--ui-border-inverted': { dark: 50 },
            },
        },
        components: { elevatedCards: true },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Orange on warm taupe, glowing actions, yellow secondary, subtle panels.',
        colors: { primary: 'orange', secondary: 'yellow', neutral: 'taupe' },
        radius: 0.625,
        font: { sans: 'Bricolage Grotesque' },
        style: {
            defaults: { variants: { panels: 'subtle' } },
            tokenShades: {
                '--ui-bg': { light: 50 },
                '--ui-bg-muted': { light: 100 },
                '--ui-text-inverted': { light: 50 },
                '--ui-text-highlighted': { dark: 50 },
                '--ui-bg-inverted': { dark: 50 },
                '--ui-border-inverted': { dark: 50 },
                '--ui-primary': { light: 600 },
            },
        },
        components: { glowingButtons: true },
    },
    {
        id: 'carbon',
        name: 'Carbon',
        description: 'Amber on a warm carbon neutral, with ink-dark borders throughout.',
        palettes: {
            carbon: {
                50: 'oklch(98.5% 0.017 447.457)',
                100: 'oklch(95.9% 0.036 438.639)',
                200: 'oklch(92.6% 0.054 428.8)',
                300: 'oklch(87% 0.053 417.734)',
                400: 'oklch(70.5% 0.032 405.184)',
                500: 'oklch(55.3% 0.014 390.836)',
                600: 'oklch(44.7% 0.001 374.343)',
                700: 'oklch(35.9% 0 0)',
                800: 'oklch(28% 0 0)',
                900: 'oklch(20.8% 0 0)',
                950: 'oklch(14.1% 0.005 285.805)',
            },
        },
        colors: { primary: 'amber', secondary: 'yellow', neutral: 'carbon' },
        radius: 0.5,
        font: { sans: 'Outfit' },
        style: {
            defaults: { variants: { buttons: 'solid', panels: 'subtle', inputs: 'subtle' } },
            tokenShades: {
                '--ui-bg': { light: 50, dark: 800 },
                '--ui-bg-muted': { light: 300, dark: 700 },
                '--ui-bg-elevated': { light: 300, dark: 700 },
                '--ui-bg-accented': { light: 400, dark: 600 },
                '--ui-bg-inverted': { light: 900, dark: 50 },
                '--ui-text-inverted': { light: 50 },
                '--ui-text-dimmed': { light: 500, dark: 400 },
                '--ui-text-muted': { light: 800, dark: 300 },
                '--ui-text-toned': { light: 900 },
                '--ui-text': { light: 900 },
                '--ui-text-highlighted': { light: 950, dark: 100 },
                '--ui-border': { light: 950, dark: 600 },
                '--ui-border-muted': { light: 400 },
                '--ui-border-accented': { light: 950, dark: 500 },
                '--ui-border-inverted': { light: 500, dark: 50 },
            },
        },
    },
    {
        id: 'bubblegum',
        name: 'Bubblegum',
        description: 'Pastel pink softness with mauve-tinted grays.',
        palettes: {
            'saturated-mauve': {
                50: 'oklch(96.1% 0.021 325.68)',
                100: 'oklch(92.4% 0.039 325.829)',
                200: 'oklch(88% 0.057 325.83)',
                300: 'oklch(81.2% 0.073 325.398)',
                400: 'oklch(66.1% 0.084 323.292)',
                500: 'oklch(52.4% 0.079 322.443)',
                600: 'oklch(42.7% 0.064 322.128)',
                700: 'oklch(34.6% 0.048 322.004)',
                800: 'oklch(27.4% 0.034 321.983)',
                900: 'oklch(20.7% 0.02 322.028)',
                950: 'oklch(14.5% 0.008 322.12)',
            },
        },
        colors: { primary: 'pink', secondary: 'violet', neutral: 'saturated-mauve' },
        radius: 0.375,
        font: { sans: 'Poppins' },
        tokens: {
            light: {
                '--ui-bg': 'var(--ui-color-neutral-50)',
                '--ui-text-inverted': 'var(--ui-color-neutral-50)',
                '--ui-bg-muted': 'var(--ui-color-neutral-100)',
            },
            dark: {
                '--ui-bg-inverted': 'var(--ui-color-neutral-50)',
                '--ui-text-highlighted': 'var(--ui-color-neutral-50)',
                '--ui-border-inverted': 'var(--ui-color-neutral-50)',
            },
        },
    },
    {
        id: 'parchment',
        name: 'Parchment',
        description: 'Warm parchment neutrals with a book-cloth clay primary.',
        palettes: {
            clay: {
                50: 'oklch(97.4% 0.009 48.308)',
                100: 'oklch(94.2% 0.019 52.207)',
                200: 'oklch(88.5% 0.036 51.142)',
                300: 'oklch(82.1% 0.058 50.392)',
                400: 'oklch(74.1% 0.094 47.255)',
                500: 'oklch(67.2% 0.131 38.798)',
                600: 'oklch(58.9% 0.138 37.63)',
                700: 'oklch(51.4% 0.123 37.45)',
                800: 'oklch(44.4% 0.103 36.916)',
                900: 'oklch(38.8% 0.086 36.46)',
                950: 'oklch(25.9% 0.054 38.197)',
            },
            parchment: {
                50: 'oklch(98% 0.006 100)',
                100: 'oklch(96.5% 0.011 99)',
                200: 'oklch(93.6% 0.014 97.348)',
                300: 'oklch(85.8% 0.018 100)',
                400: 'oklch(72.1% 0.015 102.54)',
                500: 'oklch(57.8% 0.008 88.877)',
                600: 'oklch(43.2% 0.006 91.526)',
                700: 'oklch(38.2% 0.003 84.572)',
                800: 'oklch(29.3% 0.003 106.588)',
                900: 'oklch(21.7% 0.002 106.561)',
                950: 'oklch(14.6% 0 0)',
            },
        },
        colors: { primary: 'clay', neutral: 'parchment' },
        radius: 0.375,
        font: { sans: 'DM Sans', serif: 'Source Serif 4' },
        tokens: {
            light: {
                '--ui-bg': 'var(--ui-color-neutral-100)',
                '--ui-bg-muted': 'var(--ui-color-neutral-200)',
                '--ui-bg-elevated': 'var(--ui-color-neutral-200)',
                '--ui-bg-accented': 'var(--ui-color-neutral-300)',
                '--ui-border': 'var(--ui-color-neutral-300)',
                '--ui-border-muted': 'var(--ui-color-neutral-300)',
                '--ui-border-accented': 'var(--ui-color-neutral-400)',
            },
            dark: { '--ui-primary': 'var(--ui-color-primary-500)', '--ui-bg-accented': 'var(--ui-color-neutral-800)' },
        },
    },
] satisfies ThemePreset[];

export type ThemePresetId = (typeof themePresets)[number]['id'];

export const themePresetOptions = themePresets.map(({ id, name, description }) => ({ id, label: name, description }));

const defaultColorRoles: Record<ThemeColorRole, string> = {
    primary: 'green',
    secondary: 'blue',
    success: 'green',
    info: 'blue',
    warning: 'yellow',
    error: 'red',
    neutral: 'slate',
};

export function getThemePreset(id: unknown): ThemePreset {
    return themePresets.find((preset) => preset.id === id) ?? themePresets[0];
}

export function getThemePalette(preset: ThemePreset, name: string): ThemePalette {
    const palette = preset.palettes?.[name] ?? tailwindPalettes[name];

    if (palette) {
        return themeShades.reduce((resolved, shade) => {
            resolved[shade] = palette[shade] ?? '';
            return resolved;
        }, {} as ThemePalette);
    }

    return themeShades.reduce((resolved, shade) => {
        resolved[shade] = '';
        return resolved;
    }, {} as ThemePalette);
}

export function getThemeColorRoles(preset: ThemePreset): Record<ThemeColorRole, string> {
    return { ...defaultColorRoles, ...preset.colors };
}

export function getThemeDefaults(preset: ThemePreset): {
    button: { color: 'primary'; variant: ThemeButtonVariant; size: ThemeComponentSize };
    card: { variant: 'outline' | 'subtle' | undefined };
    input: ThemeComponentDefaults;
    inputMenu: ThemeComponentDefaults;
    select: ThemeComponentDefaults;
    selectMenu: ThemeComponentDefaults;
    textarea: ThemeComponentDefaults;
} {
    const defaults = preset.style?.defaults;
    const inputDefaults: ThemeComponentDefaults = {
        color: defaults?.colors?.inputs ?? 'neutral',
        variant: defaults?.variants?.inputs ?? 'outline',
        size: defaults?.size ?? 'md',
    };

    return {
        button: { color: 'primary', variant: defaults?.variants?.buttons ?? 'solid', size: defaults?.size ?? 'md' },
        card: { variant: defaults?.variants?.panels },
        input: inputDefaults,
        inputMenu: inputDefaults,
        select: inputDefaults,
        selectMenu: inputDefaults,
        textarea: inputDefaults,
    };
}

export function getThemeUi(preset: ThemePreset) {
    const ui: Record<string, Record<string, string>> = {};
    if (preset.components?.roundedControls || preset.components?.glowingButtons) {
        ui.button = {
            base: [preset.components.roundedControls ? 'rounded-full' : '', preset.components.glowingButtons ? 'shadow-md shadow-primary/30' : '']
                .filter(Boolean)
                .join(' '),
        };
    }

    if (preset.components?.roundedControls) {
        ui.input = { base: 'rounded-full' };
        ui.inputMenu = { base: 'rounded-full' };
        ui.select = { base: 'rounded-full' };
        ui.selectMenu = { base: 'rounded-full' };
    }

    if (preset.components?.elevatedCards) {
        ui.card = { root: 'shadow-xl shadow-black/5 ring-0' };
    }

    return ui;
}

export function isThemePresetId(value: unknown): value is ThemePresetId {
    return typeof value === 'string' && themePresets.some((preset) => preset.id === value);
}

export { defaultColorRoles };
