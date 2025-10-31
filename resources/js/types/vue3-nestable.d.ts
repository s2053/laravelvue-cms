declare module 'vue3-nestable' {
    // Slot props for the default slot used by VueNestable
    type NestableDefaultSlotProps = {
        item: any;
        index?: number;
        isChild?: boolean;
        isCopy?: boolean;
    };

    type NestableSlots = {
        default?: (props: NestableDefaultSlotProps) => any;
        placeholder?: () => any;
    };

    // The package exposes the Vue component as a named export `VueNestable`
    // Use `any` to avoid strict slot typing issues in Volar — this keeps editor errors away
    export const VueNestable: any;
    export const VueNestableHandle: any;

    // It also provides a default export which is the installable plugin
    const _default: any;
    export default _default;
}
