"use strict";
import powerbi from "powerbi-visuals-api";
import {FormattingSettingsService} from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import {VisualFormattingSettingsModel} from "./settings";
import {createTooltipServiceWrapper, ITooltipServiceWrapper} from "powerbi-visuals-utils-tooltiputils";
import {DataParser} from "./dataParser";
import {ColorManager} from "./colorManager";
import {MapManager} from "./mapManager";
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
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private host: IVisualHost;
    private dataView: DataView;
    private eventService: IVisualEventService;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private mapManager: MapManager;
    private routeRenderer: RouteRenderer;
    private selectionHandler: SelectionHandler;
    private dataParser: DataParser;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.formattingSettingsService = new FormattingSettingsService();
        this.host = options.host;
        this.eventService = options.host.eventService;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, this.target);

        this.mapContainer = document.createElement("div");
        this.mapContainer.className = "route-map";
        this.mapContainer.style.width = "100%";
        this.mapContainer.style.height = "100%";
        this.target.appendChild(this.mapContainer);

        this.mapManager = new MapManager(this.mapContainer);
        this.selectionHandler = new SelectionHandler(options.host.createSelectionManager());

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
            if (!options?.dataViews?.[0]) return;

            this.dataView = options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                options.dataViews
            );

            const categorical = this.dataView.categorical;
            this.target.style.width = `${options.viewport.width}px`;
            this.target.style.height = `${options.viewport.height}px`;
            this.mapManager.invalidateSize();

            this.dataParser = new DataParser(this.host, this.dataView);
            const colorManager = new ColorManager(this.formattingSettings);

            const data = this.dataParser.parseRouteData(categorical);
            const selectionIds = this.dataParser.createSelectionIds(data.length);
            data.forEach((route, i) => route.selectionId = selectionIds[i]);

            this.routeRenderer = new RouteRenderer(
                this.mapManager,
                colorManager,
                this.selectionHandler,
                this.tooltipServiceWrapper,
                this.host,
                this.dataView,
                this.formattingSettings
            );

            const tooltipFields = this.dataParser.getTooltipFields(categorical);

            this.routeRenderer.drawRoutes(data, options.viewport, tooltipFields, categorical);

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

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

