import { onBeforeUnmount } from 'vue';

interface DebounceOptions {
    wait?: number;
    leading?: boolean; // invoke on leading edge
    trailing?: boolean; // invoke on trailing edge (default true)
}

export function useDebounce<T extends (...args: any[]) => void>(fn: T, options: DebounceOptions = {}) {
    const { wait = 300, leading = false, trailing = true } = options;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = (...args: Parameters<T>) => {
        lastArgs = args;

        const invoke = () => {
            if (trailing && lastArgs) {
                fn(...lastArgs);
                lastArgs = null;
            }
        };

        if (timeout) clearTimeout(timeout);

        if (leading && !timeout) {
            fn(...args);
        }

        timeout = setTimeout(invoke, wait);
    };

    const cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            lastArgs = null;
        }
    };

    onBeforeUnmount(cancel);

    return { debounced, cancel };
}
