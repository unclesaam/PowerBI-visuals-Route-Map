"use strict";
import powerbi from "powerbi-visuals-api";
import {RouteData} from "./types";
import {ValidationUtils} from "./validationUtils";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;

export class DataParser {
    private host: IVisualHost;
    private dataView: DataView;

    constructor(host: IVisualHost, dataView: DataView) {
        this.host = host;
        this.dataView = dataView;
    }

    public getColumnByRole(
        categorical: powerbi.DataViewCategorical,
        roleName: string
    ): powerbi.DataViewCategoricalColumn | powerbi.DataViewValueColumn | undefined {
        const category = categorical.categories?.find(cat => cat.source.roles?.[roleName]);
        if (category) return category;

        const value = categorical.values?.find(val => val.source.roles?.[roleName]);
        if (value) return value;

        return undefined;
    }

    public parseRouteData(categorical: powerbi.DataViewCategorical): RouteData[] {
        const originColumn = this.getColumnByRole(categorical, "origin");
        const originLatColumn = this.getColumnByRole(categorical, "originLat");
        const originLngColumn = this.getColumnByRole(categorical, "originLng");
        const destinationColumn = this.getColumnByRole(categorical, "destination");
        const destLatColumn = this.getColumnByRole(categorical, "destLat");
        const destLngColumn = this.getColumnByRole(categorical, "destLng");
        const lineWidthColumn = this.getColumnByRole(categorical, "lineWidth");

        const originValues = originColumn && "values" in originColumn ? originColumn.values : [];
        const originLatValues = originLatColumn && "values" in originLatColumn ? originLatColumn.values : [];
        const originLngValues = originLngColumn && "values" in originLngColumn ? originLngColumn.values : [];
        const destinationValues = destinationColumn && "values" in destinationColumn ? destinationColumn.values : [];
        const destLatValues = destLatColumn && "values" in destLatColumn ? destLatColumn.values : [];
        const destLngValues = destLngColumn && "values" in destLngColumn ? destLngColumn.values : [];
        const lineWidthValues = lineWidthColumn && "values" in lineWidthColumn ? lineWidthColumn.values : [];

        const data: RouteData[] = originLatValues.map((_, index) => ({
            origin: originValues[index]?.toString() || '',
            destination: destinationValues[index]?.toString() || '',
            originLat: parseFloat(originLatValues[index] as any),
            originLng: parseFloat(originLngValues[index] as any),
            destLat: parseFloat(destLatValues[index] as any),
            destLng: parseFloat(destLngValues[index] as any),
            lineWidth: lineWidthValues ? parseFloat(lineWidthValues[index] as any) : NaN
        })).filter(route => ValidationUtils.isValidRouteData(route));

        return data;
    }

    public createSelectionIds(categorical: powerbi.DataViewCategorical): powerbi.visuals.ISelectionId[] {
        const originLatColumn = this.getColumnByRole(categorical, "originLat");
        const originLatValues = originLatColumn && "values" in originLatColumn ? originLatColumn.values : [];

        const selectionIds = originLatValues.map((_, index) => {
            return this.host.createSelectionIdBuilder()
                .withTable(this.dataView.table, index)
                .createSelectionId();
        });

        return selectionIds;
    }

    public getTooltipFields(categorical: powerbi.DataViewCategorical): (powerbi.DataViewValueColumn | powerbi.DataViewCategoryColumn)[] {
        const tooltipFields = [
            ...(categorical.values?.filter(v => v.source.roles?.tooltips) || []),
            ...(categorical.categories?.filter(c => c.source.roles?.tooltips) || [])
        ];

        return tooltipFields;
    }
}

