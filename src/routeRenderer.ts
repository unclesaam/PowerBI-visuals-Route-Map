"use strict";
import powerbi from "powerbi-visuals-api";
import * as L from "leaflet";
import * as d3 from "d3";
import {ITooltipServiceWrapper} from "powerbi-visuals-utils-tooltiputils";
import {RouteData} from "./types";
import {ColorManager} from "./colorManager";
import {MapManager} from "./mapManager";
import {SelectionHandler} from "./selectionHandler";
import {VisualFormattingSettingsModel} from "./settings";
import DataView = powerbi.DataView;

export class RouteRenderer {
    private mapManager: MapManager;
    private colorManager: ColorManager;
    private selectionHandler: SelectionHandler;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private host: powerbi.extensibility.visual.IVisualHost;
    private dataView: DataView;
    private formattingSettings: VisualFormattingSettingsModel;

    constructor(
        mapManager: MapManager,
        colorManager: ColorManager,
        selectionHandler: SelectionHandler,
        tooltipServiceWrapper: ITooltipServiceWrapper,
        host: powerbi.extensibility.visual.IVisualHost,
        dataView: DataView,
        formattingSettings: VisualFormattingSettingsModel
    ) {
        this.mapManager = mapManager;
        this.colorManager = colorManager;
        this.selectionHandler = selectionHandler;
        this.tooltipServiceWrapper = tooltipServiceWrapper;
        this.host = host;
        this.dataView = dataView;
        this.formattingSettings = formattingSettings;
    }

    public drawRoutes(
        data: RouteData[],
        viewport: powerbi.IViewport,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        categorical: powerbi.DataViewCategorical
    ): void {
        if (!data.length) return;

        this.mapManager.clearRoutes();
        this.mapManager.setAutoZoom(this.formattingSettings.mapSettingsCard.autoZoom.value);
        this.mapManager.setZoomButtons(this.formattingSettings.mapSettingsCard.zoomButtons.value);
        this.mapManager.setMapStyle(String(this.formattingSettings.mapSettingsCard.mapStyle.value.value));

        const lineWidthSetting = this.formattingSettings.routeSettingsCard.lineWidth.value;
        const originBubbleSizeSetting = this.formattingSettings.originBubblesCard.bubbleSize.value;
        const destBubbleSizeSetting = this.formattingSettings.destinationBubblesCard.bubbleSize.value;

        const validWidths = data.map(d => d.lineWidth).filter(v => !isNaN(v));
        const hasValidWidths = validWidths.length > 0;
        const minWidth = lineWidthSetting;
        const maxWidth = lineWidthSetting * 3;
        const minValue = hasValidWidths ? Math.min(...validWidths) : 0;
        const maxValue = hasValidWidths ? Math.max(...validWidths) : 1;

        // Calculate min/max for bubble sizes from data
        const validOriginBubbleSizes = data.map(d => d.originBubbleSize).filter(v => !isNaN(v));
        const validDestBubbleSizes = data.map(d => d.destBubbleSize).filter(v => !isNaN(v));
        const hasValidOriginSizes = validOriginBubbleSizes.length > 0;
        const hasValidDestSizes = validDestBubbleSizes.length > 0;
        const minOriginSize = hasValidOriginSizes ? Math.min(...validOriginBubbleSizes) : 0;
        const maxOriginSize = hasValidOriginSizes ? Math.max(...validOriginBubbleSizes) : 1;
        const minDestSize = hasValidDestSizes ? Math.min(...validDestBubbleSizes) : 0;
        const maxDestSize = hasValidDestSizes ? Math.max(...validDestBubbleSizes) : 1;

        const bounds = L.latLngBounds([]);

        const valueColumns = categorical?.values || [];

        const highlightedColumn = valueColumns.find(col =>
            col.highlights && col.highlights.some(h => h !== null)
        );
        const hasHighlights = !!highlightedColumn;

        const originCounts: Record<string, number> = {};
        const destCounts: Record<string, number> = {};

        const originMarkers: Record<string, RouteData[]> = {};
        const destMarkers: Record<string, RouteData[]> = {};

        data.forEach((route, index) => {
            const originKey = `${route.originLat},${route.originLng}`;
            const destKey = `${route.destLat},${route.destLng}`;

            originCounts[originKey] = (originCounts[originKey] || 0) + 1;
            destCounts[destKey] = (destCounts[destKey] || 0) + 1;

            originMarkers[originKey] = originMarkers[originKey] || [];
            destMarkers[destKey] = destMarkers[destKey] || [];

            originMarkers[originKey].push(route);
            destMarkers[destKey].push(route);
        });

        const getOriginRadius = (count: number, max: number, route: RouteData) => {
            const minR = originBubbleSizeSetting;
            const maxR = originBubbleSizeSetting * 2.5;
            const scale = Math.sqrt(count / max);
            let radius = minR + scale * (maxR - minR);

            // Apply data field multiplier if available
            if (!isNaN(route.originBubbleSize) && hasValidOriginSizes) {
                const sizeRange = Math.max(maxOriginSize - minOriginSize, 1e-6);
                const sizeNorm = (route.originBubbleSize - minOriginSize) / sizeRange;
                // Scale radius by normalized data value (0.5x to 2x)
                const multiplier = 0.5 + sizeNorm * 1.5;
                radius *= multiplier;
            }

            return radius;
        };

        const getDestRadius = (count: number, max: number, route: RouteData) => {
            const minR = destBubbleSizeSetting;
            const maxR = destBubbleSizeSetting * 2.5;
            const scale = Math.sqrt(count / max);
            let radius = minR + scale * (maxR - minR);

            // Apply data field multiplier if available
            if (!isNaN(route.destBubbleSize) && hasValidDestSizes) {
                const sizeRange = Math.max(maxDestSize - minDestSize, 1e-6);
                const sizeNorm = (route.destBubbleSize - minDestSize) / sizeRange;
                // Scale radius by normalized data value (0.5x to 2x)
                const multiplier = 0.5 + sizeNorm * 1.5;
                radius *= multiplier;
            }

            return radius;
        };

        const maxOrigin = Math.max(...Object.values(originCounts));
        const maxDest = Math.max(...Object.values(destCounts));

        data.forEach((route, index) => {
            const range = Math.max(maxValue - minValue, 1e-6);
            const norm = (route.lineWidth - minValue) / range;
            const width = hasValidWidths
                ? minWidth + Math.pow(norm, 0.5) * (maxWidth - minWidth)
                : lineWidthSetting;

            const routeColor = this.colorManager.getRouteColor(route, index);
            const originBubbleColor = this.colorManager.getOriginBubbleColor(route, index);
            const destBubbleColor = this.colorManager.getDestinationBubbleColor(route, index);

            const pathCoordinates: [number, number][] = this.mapManager.getCurvedPathCoordinates(
                [route.originLat, route.originLng],
                [route.destLat, route.destLng]
            );

            const selectionId = this.host.createSelectionIdBuilder()
                .withTable(this.dataView.table, index)
                .createSelectionId();

            const isHighlighted = !hasHighlights || (highlightedColumn?.highlights?.[index] != null);

            const isSelected =
                !hasHighlights && (
                    this.selectionHandler.getSelectedIds().length === 0 ||
                    this.selectionHandler.getSelectedIds().some(id =>
                        (id as any).getKey?.() === (selectionId as any).getKey?.()
                    )
                );

            const opacity = (hasHighlights && !isHighlighted) || (!hasHighlights && !isSelected) ? 0.3 : 1;

            const lineColor = routeColor;
            const fillColor = routeColor;
            const fillOpacity = opacity;

            const polyline = L.polyline(pathCoordinates, {
                color: lineColor,
                weight: width,
                opacity: opacity
            }).addTo(this.mapManager.getRouteGroup());

            this.addPolylineTooltip(polyline, route, tooltipFields, index);
            this.addPolylineInteraction(polyline, route, data, viewport, tooltipFields, categorical);

            bounds.extend([route.originLat, route.originLng]);
            bounds.extend([route.destLat, route.destLng]);

            const originKey = `${route.originLat},${route.originLng}`;
            const destKey = `${route.destLat},${route.destLng}`;

            // Use the first route at each location for size calculation
            const originRouteForSize = originMarkers[originKey][0];
            const destRouteForSize = destMarkers[destKey][0];

            const originRadius = getOriginRadius(originCounts[originKey], maxOrigin, originRouteForSize);
            const destRadius = getDestRadius(destCounts[destKey], maxDest, destRouteForSize);

            // Only render origin bubble if show is enabled
            if (this.formattingSettings.originBubblesCard.show.value) {
                const originCircle = L.circleMarker([route.originLat, route.originLng], {
                    radius: originRadius,
                    color: originBubbleColor,
                    fillColor: originBubbleColor,
                    fillOpacity: fillOpacity,
                    weight: 2
                }).addTo(this.mapManager.getRouteGroup());

                this.addOriginCircleTooltip(originCircle, route, tooltipFields, index);
                this.addOriginCircleInteraction(originCircle, route, data, viewport, tooltipFields, categorical);
            }

            // Only render destination bubble if show is enabled
            if (this.formattingSettings.destinationBubblesCard.show.value) {
                const destCircle = L.circleMarker([route.destLat, route.destLng], {
                    radius: destRadius,
                    color: destBubbleColor,
                    fillColor: destBubbleColor,
                    fillOpacity: fillOpacity,
                    weight: 2
                }).addTo(this.mapManager.getRouteGroup());

                this.addDestCircleTooltip(destCircle, route, tooltipFields, index);
                this.addDestCircleInteraction(destCircle, route, data, viewport, tooltipFields, categorical);
            }
        });

        this.mapManager.fitBounds(bounds);
    }

    private addPolylineTooltip(
        polyline: L.Polyline,
        route: RouteData,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        index: number
    ): void {
        const polylineElement = polyline.getElement();
        const d3PolylineSelection = d3.select(polylineElement);

        if (tooltipFields.length > 0) {
            this.tooltipServiceWrapper.addTooltip(
                d3PolylineSelection,
                () => tooltipFields.map(field => ({
                    displayName: field.source.displayName,
                    value: Array.isArray(field.values) ? field.values[index]?.toString() ?? "" : ""
                })),
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        } else {
            this.tooltipServiceWrapper.addTooltip(
                d3PolylineSelection,
                () => [{
                    displayName: "Origin",
                    value: `${route.originLat}, ${route.originLng}`
                }, {
                    displayName: "Destination",
                    value: `${route.destLat}, ${route.destLng}`
                }],
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        }
    }

    private addPolylineInteraction(
        polyline: L.Polyline,
        route: RouteData,
        data: RouteData[],
        viewport: powerbi.IViewport,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        categorical: powerbi.DataViewCategorical
    ): void {
        polyline.on("click", (e: any) => {
            const multiSelect = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
            this.selectionHandler.handleSelection(route.selectionId, multiSelect).then(() => {
                this.drawRoutes(data, viewport, tooltipFields, categorical);
            });
        });

        polyline.on("contextmenu", (e: any) => {
            if (!this.selectionHandler.getContextMenuShown()) {
                this.selectionHandler.showContextMenu(route.selectionId, {
                    x: e.originalEvent.clientX,
                    y: e.originalEvent.clientY
                });
            }
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
        });
    }

    private addOriginCircleTooltip(
        originCircle: L.CircleMarker,
        route: RouteData,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        index: number
    ): void {
        const originElement = originCircle.getElement();
        const d3OriginSelection = d3.select(originElement);

        if (tooltipFields.length > 0) {
            this.tooltipServiceWrapper.addTooltip(
                d3OriginSelection,
                () => tooltipFields.map(field => ({
                    displayName: field.source.displayName,
                    value: "values" in field ? field.values[index]?.toString() ?? "" : ""
                })),
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        } else {
            this.tooltipServiceWrapper.addTooltip(
                d3OriginSelection,
                () => [{
                    displayName: "Origin",
                    value: `${route.originLat}, ${route.originLng}`
                }],
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        }
    }

    private addOriginCircleInteraction(
        originCircle: L.CircleMarker,
        route: RouteData,
        data: RouteData[],
        viewport: powerbi.IViewport,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        categorical: powerbi.DataViewCategorical
    ): void {
        originCircle.on("click", (e: any) => {
            const lat = route.originLat;
            const lng = route.originLng;

            const matchingRoutes = data.filter(r =>
                r.originLat === lat && r.originLng === lng ||
                r.destLat === lat && r.destLng === lng
            );

            const selectionIds = matchingRoutes.map(r => r.selectionId).filter(id => !!id);

            const allSelected = selectionIds.length > 0 && selectionIds.every(sel =>
                this.selectionHandler.getSelectedIds().some(existing =>
                    (existing as any).getKey?.() === (sel as any).getKey?.()
                )
            );

            if (allSelected) {
                this.selectionHandler.clearSelection().then(() => {
                    this.drawRoutes(data, viewport, tooltipFields, categorical);
                });
            } else {
                const multiSelect = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                this.selectionHandler.handleSelection(selectionIds, multiSelect).then(() => {
                    this.drawRoutes(data, viewport, tooltipFields, categorical);
                });
            }
        });

        originCircle.on("contextmenu", (e: any) => {
            if (!this.selectionHandler.getContextMenuShown()) {
                const lat = route.originLat;
                const lng = route.originLng;

                const matchingRoutes = data.filter(r =>
                    r.originLat === lat && r.originLng === lng ||
                    r.destLat === lat && r.destLng === lng
                );

                const selectionIds = matchingRoutes.map(r => r.selectionId).filter(id => !!id);

                const contextMenuSelectionId = selectionIds.length > 0 ? selectionIds[0] : route.selectionId;

                this.selectionHandler.showContextMenu(contextMenuSelectionId, {
                    x: e.originalEvent.clientX,
                    y: e.originalEvent.clientY
                });
            }
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
        });
    }

    private addDestCircleTooltip(
        destCircle: L.CircleMarker,
        route: RouteData,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        index: number
    ): void {
        const destElement = destCircle.getElement();
        const d3DestSelection = d3.select(destElement);

        if (tooltipFields.length > 0) {
            this.tooltipServiceWrapper.addTooltip(
                d3DestSelection,
                () => tooltipFields.map(field => ({
                    displayName: field.source.displayName,
                    value: field.values[index]?.toString() ?? ""
                })),
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        } else {
            this.tooltipServiceWrapper.addTooltip(
                d3DestSelection,
                () => [{
                    displayName: "Destination",
                    value: `${route.destLat}, ${route.destLng}`
                }],
                () => route.selectionId ? route.selectionId.getSelector() : null
            );
        }
    }

    private addDestCircleInteraction(
        destCircle: L.CircleMarker,
        route: RouteData,
        data: RouteData[],
        viewport: powerbi.IViewport,
        tooltipFields: (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[],
        categorical: powerbi.DataViewCategorical
    ): void {
        destCircle.on("click", (e: any) => {
            const lat = route.destLat;
            const lng = route.destLng;
            const matchingRoutes = data.filter(r =>
                r.originLat === lat && r.originLng === lng ||
                r.destLat === lat && r.destLng === lng
            );

            const selectionIds = matchingRoutes.map(r => r.selectionId).filter(id => !!id);

            const allSelected = selectionIds.length > 0 && selectionIds.every(sel =>
                this.selectionHandler.getSelectedIds().some(existing =>
                    (existing as any).getKey?.() === (sel as any).getKey?.()
                )
            );

            if (allSelected) {
                this.selectionHandler.clearSelection().then(() => {
                    this.drawRoutes(data, viewport, tooltipFields, categorical);
                });
            } else {
                const multiSelect = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
                this.selectionHandler.handleSelection(selectionIds, multiSelect).then(() => {
                    this.drawRoutes(data, viewport, tooltipFields, categorical);
                });
            }
        });

        destCircle.on("contextmenu", (e: any) => {
            if (!this.selectionHandler.getContextMenuShown()) {
                const lat = route.destLat;
                const lng = route.destLng;
                const matchingRoutes = data.filter(r =>
                    r.originLat === lat && r.originLng === lng ||
                    r.destLat === lat && r.destLng === lng
                );

                const selectionIds = matchingRoutes.map(r => r.selectionId).filter(id => !!id);

                const contextMenuSelectionId = selectionIds.length > 0 ? selectionIds[0] : route.selectionId;

                this.selectionHandler.showContextMenu(contextMenuSelectionId, {
                    x: e.originalEvent.clientX,
                    y: e.originalEvent.clientY
                });
            }
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
        });
    }
}

