"use strict";
import powerbi from "powerbi-visuals-api";
import {FormattingSettingsService} from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import {VisualFormattingSettingsModel} from "./settings";
import {legendInterfaces} from "powerbi-visuals-utils-chartutils";
import {createTooltipServiceWrapper, ITooltipServiceWrapper} from "powerbi-visuals-utils-tooltiputils";
import {RouteData} from "./types";
import {DataParser} from "./dataParser";
import {ColorManager} from "./colorManager";
import {MapManager} from "./mapManager";
import {LegendManager} from "./legendManager";
import {RouteRenderer} from "./routeRenderer";
import {SelectionHandler} from "./selectionHandler";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

export class Visual implements IVisual {
    private target: HTMLElement;
    private mapContainer: HTMLElement;
    private width: number = 0;
    private height: number = 0;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private dataView: DataView;
    private eventService: IVisualEventService;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private mapManager: MapManager;
    private colorManager: ColorManager;
    private legendManager: LegendManager;
    private routeRenderer: RouteRenderer;
    private selectionHandler: SelectionHandler;
    private dataParser: DataParser;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.formattingSettingsService = new FormattingSettingsService();
        this.host = options.host;
        this.eventService = options.host.eventService;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, this.target);

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flex = "1";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        this.target.appendChild(wrapper);

        const legendContainer = document.createElement("div");
        legendContainer.className = "legend-container";
        wrapper.appendChild(legendContainer);

        this.mapContainer = document.createElement("div");
        this.mapContainer.className = "route-map";
        wrapper.appendChild(this.mapContainer);

        this.mapManager = new MapManager(this.mapContainer);
        this.selectionHandler = new SelectionHandler(options.host.createSelectionManager());

        // Initialize LegendManager once in constructor - will be updated in update() method
        this.legendManager = new LegendManager(
            legendContainer,
            this.target,
            this.host,
            null,
            null,
            null,
            this.selectionHandler.getSelectedIds(),
            options.host.createSelectionManager(),
            () => this.mapManager.invalidateSize()
        );

        this.handleContextMenu();
    }

    private handleContextMenu(): void {
        this.mapManager.getMap().on('contextmenu', (event: any) => {
            if (!this.selectionHandler.getContextMenuShown() && (!event.originalEvent.target ||
                !(event.originalEvent.target as Element).closest('.leaflet-interactive'))) {
                this.selectionHandler.showContextMenu({}, {
                    x: event.originalEvent.clientX,
                    y: event.originalEvent.clientY
                });
            }
            event.originalEvent.preventDefault();
        });
    }

    public update(options: VisualUpdateOptions) {
        if (this.eventService?.renderingStarted) {
            this.eventService.renderingStarted(options);
        }

        try {
            if (!options || !options.dataViews || !options.dataViews[0]) return;
            this.dataView = options.dataViews[0];
            console.log(this.dataView);
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
            const categorical = this.dataView.categorical;
            this.width = options.viewport.width;
            this.height = options.viewport.height;
            this.target.style.width = `${this.width}px`;
            this.target.style.height = `${this.height}px`;
            this.mapManager.invalidateSize();

            this.dataParser = new DataParser(this.host, this.dataView);
            this.colorManager = new ColorManager(this.host.colorPalette, this.dataView, this.formattingSettings);

            // Update existing LegendManager with current data
            this.legendManager.updateDependencies(
                this.dataView,
                this.formattingSettings,
                this.colorManager,
                this.selectionHandler.getSelectedIds()
            );

            this.routeRenderer = new RouteRenderer(
                this.mapManager,
                this.colorManager,
                this.selectionHandler,
                this.tooltipServiceWrapper,
                this.host,
                this.dataView,
                this.formattingSettings
            );

            const tooltipFields = this.dataParser.getTooltipFields(categorical);

            const data: RouteData[] = this.dataParser.parseRouteData(categorical);

            const showLegend = this.formattingSettings.legendSettings.show.value;
            const legendPositionValue = this.formattingSettings.legendSettings.position.value.value;
            const legendPositionKey = legendInterfaces.LegendPosition[legendPositionValue];
            const defaultColor = this.formattingSettings.routeSettingsCard.lineColor.value.value;
            const legendFontSize = this.formattingSettings.legendSettings.fontSize.value;

            this.target.querySelector('.legend-container')?.setAttribute(
                'style',
                `--legend-font-size: ${legendFontSize}px;`
            );

            const selectionIds = this.dataParser.createSelectionIds(categorical);

            data.forEach((route, i) => {
                route.selectionId = selectionIds[i];
            });

            const legendColumn = this.dataParser.getColumnByRole(categorical, "legend");
            const legendValues = legendColumn && "values" in legendColumn ? legendColumn.values : [];
            const shouldShowLegend = showLegend && !!legendColumn && legendValues.length > 0;

            this.legendManager.updateLegend(data, options.viewport, shouldShowLegend, legendPositionKey, defaultColor, legendColumn);
            this.routeRenderer.drawRoutes(data, options.viewport, tooltipFields, categorical, legendColumn);

        } catch (e) {
            console.error("Rendering error:", e);
            if (this.eventService?.renderingFailed) {
                this.eventService.renderingFailed(options, e);
            }
        }

        if (this.eventService?.renderingFinished) {
            this.eventService.renderingFinished(options);
        }
    }

    // public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
    //     const instances: VisualObjectInstance[] = [];
    //
    //     if (options.objectName === 'routeSettings') {
    //         const metadata = this.dataView?.metadata;
    //         const objects = metadata?.objects;
    //         const persistedLineColor = objects?.routeSettings?.lineColor as powerbi.Fill;
    //
    //         instances.push({
    //             objectName: 'routeSettings',
    //             properties: {
    //                 lineWidth: this.formattingSettings.routeSettingsCard.lineWidth.value,
    //                 lineColor: persistedLineColor || this.formattingSettings.routeSettingsCard.lineColor.value,
    //                 bubbleSize: this.formattingSettings.routeSettingsCard.bubbleSize.value,
    //             },
    //             selector: null,
    //         });
    //     }
    //
    //     if (options.objectName === 'legend') {
    //         instances.push({
    //             objectName: 'legend',
    //             properties: {
    //                 show: this.formattingSettings.legendSettings.show.value,
    //                 position: this.formattingSettings.legendSettings.position.value.value,
    //                 fontSize: this.formattingSettings.legendSettings.fontSize.value,
    //                 showTitle: this.formattingSettings.legendSettings.showTitle.value,
    //                 titleText: this.formattingSettings.legendSettings.titleText.value
    //             },
    //             selector: null
    //         });
    //     }
    //
    //     return instances;
    // }
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

