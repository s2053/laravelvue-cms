// src/features/widgets/composables/useWidgets.ts

import { useApiErrorHandler } from '@/composables/useApiErrorHandler';
import WidgetService from '@/features/widgets/services/widget.service';
import type { Widget, WidgetItemPayload, WidgetPayload } from '@/features/widgets/widgets.types';
import { ref } from 'vue';

export function useWidgets() {
    const { handleError } = useApiErrorHandler();

    const widgets = ref<Widget[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all widgets
    const fetchWidgets = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await WidgetService.getAll();
            widgets.value = res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch widgets';
        } finally {
            loading.value = false;
        }
    };

    // Get widget by ID
    const getWidgetById = async (id: number) => {
        try {
            const res = await WidgetService.getById(id);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to fetch widget';
            throw err;
        }
    };

    // Create new widget
    const createWidget = async (widget: WidgetPayload) => {
        try {
            const res = await WidgetService.create(widget);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to create widget';
            throw err;
        }
    };

    // Update existing widget
    const updateWidget = async (id: number, widget: WidgetPayload) => {
        try {
            const res = await WidgetService.update(id, widget);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update widget';
            throw err;
        }
    };

    // Delete widget by ID
    const deleteWidget = async (id: number) => {
        try {
            await WidgetService.delete(id);
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to delete widget';
            throw err;
        }
    };

    // Bulk update widgets by action and IDs
    const bulkUpdateWidgets = async (action: string, ids: number[], data?: Record<string, any>) => {
        try {
            await WidgetService.bulkUpdate({ action, ids, data });
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to perform bulk update';
            throw err;
        }
    };

    const updateWidgetItems = async (widgetId: number, items: WidgetItemPayload[]) => {
        try {
            const res = await WidgetService.updateWidgetItems(widgetId, items);
            return res.data;
        } catch (err: any) {
            handleError(err);
            error.value = err.message || 'Failed to update widget items';
            throw err;
        }
    };

    return {
        widgets,
        loading,
        error,
        fetchWidgets,
        getWidgetById,
        createWidget,
        updateWidget,
        deleteWidget,
        bulkUpdateWidgets,
        updateWidgetItems,
    };
}
