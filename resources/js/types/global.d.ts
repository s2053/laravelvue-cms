import Alpine from 'alpinejs';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}

// Don't forget to actually assign it to `window.Alpine` in the main code
window.Alpine = Alpine;

export {};
