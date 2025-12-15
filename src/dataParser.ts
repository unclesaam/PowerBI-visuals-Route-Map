"use strict";
import powerbi from "powerbi-visuals-api";
import {RouteData} from "./types";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;

/**
 * DataParser handles extraction and validation of data from Power BI DataView.
 * It validates coordinates and filters out invalid routes before rendering.
 */
export class DataParser {
    private host: IVisualHost;
    private dataView: DataView;

    constructor(host: IVisualHost, dataView: DataView) {
        this.host = host;
        this.dataView = dataView;
    }

    private getColumn(categorical: powerbi.DataViewCategorical, roleName: string) {
        return categorical.categories?.find(cat => cat.source.roles?.[roleName]) ||
               categorical.values?.find(val => val.source.roles?.[roleName]);
    }

    private isValidRoute(route: RouteData): boolean {
        const isValidLat = (lat: number) => !isNaN(lat) && lat >= -90 && lat <= 90;
        const isValidLng = (lng: number) => !isNaN(lng) && lng >= -180 && lng <= 180;

        return isValidLat(route.originLat) && isValidLat(route.destLat) &&
               isValidLng(route.originLng) && isValidLng(route.destLng);
    }

    public parseRouteData(categorical: powerbi.DataViewCategorical): RouteData[] {
        const originLatCol = this.getColumn(categorical, "originLat");
        const originLngCol = this.getColumn(categorical, "originLng");
        const destLatCol = this.getColumn(categorical, "destLat");
        const destLngCol = this.getColumn(categorical, "destLng");
        const lineWidthCol = this.getColumn(categorical, "lineWidth");

        const getValues = (col: any) => col && "values" in col ? col.values : [];

        const data: RouteData[] = getValues(originLatCol).map((_: any, i: number) => ({
            originLat: parseFloat(getValues(originLatCol)[i]),
            originLng: parseFloat(getValues(originLngCol)[i]),
            destLat: parseFloat(getValues(destLatCol)[i]),
            destLng: parseFloat(getValues(destLngCol)[i]),
            lineWidth: parseFloat(getValues(lineWidthCol)[i]) || NaN
        })).filter((route: RouteData) => this.isValidRoute(route));

        return data;
    }

    public createSelectionIds(dataLength: number): powerbi.visuals.ISelectionId[] {
        return Array.from({length: dataLength}, (_, i) =>
            this.host.createSelectionIdBuilder().withTable(this.dataView.table, i).createSelectionId()
        );
    }

    public getTooltipFields(categorical: powerbi.DataViewCategorical) {
        return [
            ...(categorical.values?.filter(v => v.source.roles?.tooltips) || []),
            ...(categorical.categories?.filter(c => c.source.roles?.tooltips) || [])
        ];
    }
}

