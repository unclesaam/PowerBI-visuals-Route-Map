"use strict";
import powerbi from "powerbi-visuals-api";
import {VisualFormattingSettingsModel} from "./settings";
import IColorPalette = powerbi.extensibility.IColorPalette;
import DataView = powerbi.DataView;

export class ColorManager {
    private colorPalette: IColorPalette;
    private dataView: DataView;
    private formattingSettings: VisualFormattingSettingsModel;
    private colorCache: Map<string, string> = new Map();
    private isHighContrast: boolean;
    private foregroundColor: string;
    private backgroundColor: string;
    private foregroundSelectedColor: string;

    constructor(
        colorPalette: IColorPalette,
        dataView: DataView,
        formattingSettings: VisualFormattingSettingsModel
    ) {
        this.colorPalette = colorPalette;
        this.dataView = dataView;
        this.formattingSettings = formattingSettings;
        this.isHighContrast = (colorPalette as any).isHighContrast || false;

        if (this.isHighContrast) {
            this.foregroundColor = (colorPalette as any).foreground?.value || "#000";
            this.backgroundColor = (colorPalette as any).background?.value || "#fff";
            this.foregroundSelectedColor = (colorPalette as any).foregroundSelected?.value || "#000";
        } else {
            this.foregroundColor = "#000";
            this.backgroundColor = "#fff";
            this.foregroundSelectedColor = "#000";
        }
    }

    public getIsHighContrast(): boolean {
        return this.isHighContrast;
    }

    public getForegroundColor(): string {
        return this.foregroundColor;
    }

    public getBackgroundColor(): string {
        return this.backgroundColor;
    }

    public getForegroundSelectedColor(): string {
        return this.foregroundSelectedColor;
    }


    public getColorForValue(value: string, legendColumn: powerbi.DataViewCategoricalColumn | powerbi.DataViewValueColumn | undefined): string {
        console.log('value:', value)
        console.log('legendColumn:', legendColumn)

        if (this.isHighContrast) {
            return this.foregroundColor;
        }

        if (!legendColumn) {
            return this.formattingSettings.routeSettingsCard.lineColor.value.value;
        }

        const index = ("values" in legendColumn) ? legendColumn.values.findIndex(v => v?.toString() === value) : -1;
        const object = ("objects" in legendColumn) ? legendColumn.objects?.[index] : undefined;
        const colorObj = object?.dataPoint?.fill as powerbi.Fill;
        const userColor = colorObj?.solid?.color;

        if (userColor) {
            return userColor;
        }

        if (!this.colorCache.has(value)) {
            this.colorCache.set(value, this.colorPalette.getColor(value).value);
        }
        return this.colorCache.get(value);
    }
}

