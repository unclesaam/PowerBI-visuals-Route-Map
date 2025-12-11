"use strict";
import powerbi from "powerbi-visuals-api";
import {legend, legendInterfaces} from "powerbi-visuals-utils-chartutils";
import {RouteData} from "./types";
import {ColorManager} from "./colorManager";
import {VisualFormattingSettingsModel} from "./settings";
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;

export class LegendManager {
    private legend: legendInterfaces.ILegend;
    private target: HTMLElement;
    private host: IVisualHost;
    private dataView: DataView;
    private formattingSettings: VisualFormattingSettingsModel;
    private colorManager: ColorManager;
    private selectedIds: powerbi.extensibility.ISelectionId[];
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private contextMenuShown: boolean = false;
    private mapInvalidateSizeCallback: () => void;

    constructor(
        legendContainer: HTMLElement,
        target: HTMLElement,
        host: IVisualHost,
        dataView: DataView,
        formattingSettings: VisualFormattingSettingsModel,
        colorManager: ColorManager,
        selectedIds: powerbi.extensibility.ISelectionId[],
        selectionManager: powerbi.extensibility.ISelectionManager,
        mapInvalidateSizeCallback: () => void
    ) {
        this.target = target;
        this.host = host;
        this.dataView = dataView;
        this.formattingSettings = formattingSettings;
        this.colorManager = colorManager;
        this.selectedIds = selectedIds;
        this.selectionManager = selectionManager;
        this.mapInvalidateSizeCallback = mapInvalidateSizeCallback;
        this.legend = legend.createLegend(legendContainer, true);
    }

    public getLegend(): legendInterfaces.ILegend {
        return this.legend;
    }

    public updateLegend(
        data: RouteData[],
        viewport: powerbi.IViewport,
        show: boolean,
        position: legendInterfaces.LegendPosition,
        defaultColor: string,
        legendColumn: powerbi.DataViewCategoricalColumn | powerbi.DataViewValueColumn | undefined
    ): void {
        const legendContainer = this.target.querySelector('.legend-container') as HTMLElement;

        const legendDisplayName = legendColumn?.source?.displayName ?? "Legend";

        const customTitle = this.formattingSettings.legendSettings.titleText.value;
        const showTitle = this.formattingSettings.legendSettings.showTitle.value;

        const legendTitle = showTitle
            ? (customTitle?.trim() || legendDisplayName)
            : "";

        const uniqueValues = legendColumn
            ? Array.from(new Set(data.map(route => route.legendValue))).sort()
            : [];

        const legendData: legendInterfaces.LegendData = {
            title: legendTitle,
            dataPoints: uniqueValues.map((value) => {
                let color = this.colorManager.getIsHighContrast() ? this.colorManager.getForegroundColor() : this.colorManager.getColorForValue(value, legendColumn) ?? defaultColor;

                const originalIndex = legendColumn && "values" in legendColumn
                    ? legendColumn.values.findIndex(v => (v?.toString() || "") === value)
                    : -1;

                if (this.colorManager.getIsHighContrast() && this.selectedIds.some(id =>
                    (id as any).getKey?.() === (this.host.createSelectionIdBuilder()
                        .withCategory(legendColumn as powerbi.DataViewCategoryColumn, originalIndex)
                        .createSelectionId() as any).getKey?.()
                )) {
                    color = this.colorManager.getForegroundSelectedColor();
                }

                const selectionId: ISelectionId = legendColumn && originalIndex >= 0
                    ? this.host.createSelectionIdBuilder()
                        .withCategory(legendColumn as powerbi.DataViewCategoryColumn, originalIndex)
                        .createSelectionId()
                    : this.host.createSelectionIdBuilder()
                        .withTable(this.dataView.table, originalIndex)
                        .createSelectionId();

                return {
                    label: value || "(Blank)",
                    color,
                    identity: selectionId,
                    selected: false
                };
            })
        };

        const legendPositionKey = position as unknown as keyof typeof legendInterfaces.LegendPosition;
        const legendEnumValue = legendInterfaces.LegendPosition[legendPositionKey];

        this.legend.changeOrientation(position as legendInterfaces.LegendPosition);

        const mapContainer = this.target.querySelector('.route-map') as HTMLElement;
        const wrapper = this.target.querySelector("div") as HTMLElement;

        if (!show) {
            legendContainer.style.display = 'none';
            mapContainer.style.marginLeft = '0';
            this.legend.drawLegend({dataPoints: []}, viewport);
            return;
        }

        legendContainer.style.display = 'block';
        legendContainer.style.marginLeft = "0";
        legendContainer.style.marginTop = "0";
        mapContainer.style.marginLeft = "0";
        mapContainer.style.marginTop = "0";

        if (position === legendInterfaces.LegendPosition.Left) {
            wrapper.style.flexDirection = "row";
            legendContainer.style.order = "0";
            mapContainer.style.order = "1";
            legendContainer.style.minWidth = "150px";
            legendContainer.style.height = "100%";
            mapContainer.style.width = "auto";
            mapContainer.style.height = "100%";
        } else if (position === legendInterfaces.LegendPosition.Right) {
            wrapper.style.flexDirection = "row";
            legendContainer.style.order = "1";
            mapContainer.style.order = "0";
            legendContainer.style.minWidth = "150px";
            legendContainer.style.height = "100%";
            mapContainer.style.width = "auto";
            mapContainer.style.height = "100%";
        } else if (position === legendInterfaces.LegendPosition.Top) {
            wrapper.style.flexDirection = "column";
            legendContainer.style.order = "0";
            mapContainer.style.order = "1";
            legendContainer.style.width = "100%";
            legendContainer.style.minHeight = "50px";
            mapContainer.style.width = "100%";
            mapContainer.style.height = "auto";
        } else if (position === legendInterfaces.LegendPosition.Bottom) {
            wrapper.style.flexDirection = "column";
            legendContainer.style.order = "1";
            mapContainer.style.order = "0";
            legendContainer.style.width = "100%";
            legendContainer.style.minHeight = "50px";
            mapContainer.style.width = "100%";
            mapContainer.style.height = "auto";
        }

        requestAnimationFrame(() => {
            setTimeout(() => {
                this.mapInvalidateSizeCallback();
            }, 50);
        });

        this.legend.drawLegend(legendData, viewport);
        this.legend.drawLegend(legendData, viewport);
        this.mapInvalidateSizeCallback();

        this.setupLegendContextMenu();
    }

    private setupLegendContextMenu(): void {
        const legendContainer = this.target.querySelector('.legend-container') as HTMLElement;
        if (legendContainer) {
            legendContainer.removeEventListener('contextmenu', this.handleLegendContextMenu);
            legendContainer.addEventListener('contextmenu', this.handleLegendContextMenu);
        }
    }

    private handleLegendContextMenu = (event: MouseEvent): void => {
        if (!this.contextMenuShown && (!event.target ||
            !(event.target as Element).closest('.legendItem'))) {
            this.contextMenuShown = true;
            this.selectionManager.showContextMenu({}, {
                x: event.clientX,
                y: event.clientY
            }).finally(() => {
                this.contextMenuShown = false;
            });
        }
        event.preventDefault();
    }
}

