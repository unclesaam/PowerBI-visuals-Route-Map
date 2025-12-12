"use strict";
import powerbi from "powerbi-visuals-api";
import {VisualFormattingSettingsModel} from "./settings";
import IColorPalette = powerbi.extensibility.IColorPalette;
import DataView = powerbi.DataView;

export class ColorManager {
    private colorPalette: IColorPalette;
    private dataView: DataView;
    private formattingSettings: VisualFormattingSettingsModel;
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

    public getRouteColor(): string {
        if (this.isHighContrast) {
            return this.foregroundColor;
        }
        return this.formattingSettings.routeSettingsCard.lineColor.value.value;
    }
}

