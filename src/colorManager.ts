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
    private defaultLineColor: string;
    private defaultOriginColor: string;
    private defaultDestColor: string;

    constructor(dataView: DataView, formattingSettings: VisualFormattingSettingsModel) {
        this.dataView = dataView;
        this.formattingSettings = formattingSettings;
        this.defaultLineColor = formattingSettings.routeSettingsCard.lineColor.value.value;
        this.defaultOriginColor = formattingSettings.originBubblesCard.bubbleColor.value.value;
        this.defaultDestColor = formattingSettings.destinationBubblesCard.bubbleColor.value.value;
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
        return this.defaultLineColor;
    }

    /**
     * Gets the color for an origin bubble, checking conditional formatting first,
     * then falling back to the default origin bubble color from settings.
     *
     * @param route - The route data
     * @param index - The row index in the DataView
     * @returns Hex color string (e.g., "#4CAF50")
     */
    public getOriginBubbleColor(route: RouteData, index: number): string {
        const categorical = this.dataView?.categorical;
        const metadata = this.dataView?.metadata;

        // Check categorical categories for per-row colors
        if (categorical?.categories) {
            for (const category of categorical.categories) {
                const objects = (category as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Check originBubbles.bubbleColor
                if (objects?.originBubbles?.bubbleColor) {
                    const colorFill = objects.originBubbles.bubbleColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check categorical values for per-row colors
        if (categorical?.values) {
            for (const valueColumn of categorical.values) {
                const objects = (valueColumn as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Check originBubbles.bubbleColor
                if (objects?.originBubbles?.bubbleColor) {
                    const colorFill = objects.originBubbles.bubbleColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check metadata for global originBubbles color
        if (metadata?.objects) {
            const originBubbles = (metadata.objects as any).originBubbles;
            if (originBubbles?.bubbleColor) {
                const colorFill = originBubbles.bubbleColor as powerbi.Fill;
                if (colorFill?.solid?.color) {
                    return colorFill.solid.color;
                }
            }
        }

        // Return default origin bubble color
        return this.defaultOriginColor;
    }

    /**
     * Gets the color for a destination bubble, checking conditional formatting first,
     * then falling back to the default destination bubble color from settings.
     *
     * @param route - The route data
     * @param index - The row index in the DataView
     * @returns Hex color string (e.g., "#FF9800")
     */
    public getDestinationBubbleColor(route: RouteData, index: number): string {
        const categorical = this.dataView?.categorical;
        const metadata = this.dataView?.metadata;

        // Check categorical categories for per-row colors
        if (categorical?.categories) {
            for (const category of categorical.categories) {
                const objects = (category as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Check destinationBubbles.bubbleColor
                if (objects?.destinationBubbles?.bubbleColor) {
                    const colorFill = objects.destinationBubbles.bubbleColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check categorical values for per-row colors
        if (categorical?.values) {
            for (const valueColumn of categorical.values) {
                const objects = (valueColumn as any).objects?.[index];
                if (objects?.dataPoint?.fill) {
                    const colorFill = objects.dataPoint.fill as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }

                // Check destinationBubbles.bubbleColor
                if (objects?.destinationBubbles?.bubbleColor) {
                    const colorFill = objects.destinationBubbles.bubbleColor as powerbi.Fill;
                    if (colorFill?.solid?.color) {
                        return colorFill.solid.color;
                    }
                }
            }
        }

        // Check metadata for global destinationBubbles color
        if (metadata?.objects) {
            const destinationBubbles = (metadata.objects as any).destinationBubbles;
            if (destinationBubbles?.bubbleColor) {
                const colorFill = destinationBubbles.bubbleColor as powerbi.Fill;
                if (colorFill?.solid?.color) {
                    return colorFill.solid.color;
                }
            }
        }

        // Return default destination bubble color
        return this.defaultDestColor;
    }
}
