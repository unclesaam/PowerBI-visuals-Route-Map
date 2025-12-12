"use strict";
import powerbi from "powerbi-visuals-api";
import {VisualFormattingSettingsModel} from "./settings";
import {RouteData} from "./types";
import DataView = powerbi.DataView;

/**
 * ColorManager handles color retrieval for routes, supporting conditional formatting
 * from Power BI. It checks multiple DataView locations for per-row color definitions.
 */
export class ColorManager {
    private dataView: DataView;
    private formattingSettings: VisualFormattingSettingsModel;
    private defaultColor: string;

    constructor(dataView: DataView, formattingSettings: VisualFormattingSettingsModel) {
        this.dataView = dataView;
        this.formattingSettings = formattingSettings;
        this.defaultColor = formattingSettings.routeSettingsCard.lineColor.value.value;
    }

    /**
     * Gets the color for a specific route, checking conditional formatting first,
     * then falling back to the default color from settings.
     *
     * @param route - The route data (not currently used but available for future logic)
     * @param index - The row index in the DataView
     * @returns Hex color string (e.g., "#FF5733")
     */
    public getRouteColor(route: RouteData, index: number): string {
        const categorical = this.dataView?.categorical;
        const metadata = this.dataView?.metadata;

        // Check categorical categories for per-row dataPoint colors (this is where Power BI stores conditional formatting)
        if (categorical?.categories) {
            for (const category of categorical.categories) {
                const objects = (category as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Also check routeSettings.lineColor as fallback
                if (objects?.routeSettings?.lineColor) {
                    const colorFill = objects.routeSettings.lineColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check categorical values for per-row dataPoint colors
        if (categorical?.values) {
            for (const valueColumn of categorical.values) {
                const objects = (valueColumn as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Also check routeSettings.lineColor as fallback
                if (objects?.routeSettings?.lineColor) {
                    const colorFill = objects.routeSettings.lineColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check metadata for global routeSettings color
        if (metadata?.objects) {
            const routeSettings = (metadata.objects as any).routeSettings;
            if (routeSettings?.lineColor) {
                const colorFill = routeSettings.lineColor as powerbi.Fill;
                if (colorFill?.solid?.color) {
                    return colorFill.solid.color;
                }
            }
        }

        // Return default color
        return this.defaultColor;
    }
}
