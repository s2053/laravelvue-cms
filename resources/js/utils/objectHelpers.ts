export function pickObjects<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<T, K>;
}

export function pickMatchData<T extends object>(source: any, target: T): T {
    console.log('t', target);
    console.log('ts', source);
    const result = {} as T;

    for (const key in target) {
        result[key] = key in source ? source[key]! : target[key];
    }

    console.log(result);
    return result;
}

export function pickCleanData<T extends object>(source: any, target: T): T {
    const result = {} as T;

    for (const key in target) {
        if (key in source) {
            result[key] = source[key];
        }
    }

    return result;
}
