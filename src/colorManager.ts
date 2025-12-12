"use strict";
import powerbi from "powerbi-visuals-api";
import {VisualFormattingSettingsModel} from "./settings";
import IColorPalette = powerbi.extensibility.IColorPalette;

export class ColorManager {
    private isHighContrast: boolean;
    private foregroundColor: string;
    private backgroundColor: string;
    private foregroundSelectedColor: string;
    private lineColor: string;

    constructor(
        colorPalette: IColorPalette,
        formattingSettings: VisualFormattingSettingsModel
    ) {
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

        this.lineColor = formattingSettings.routeSettingsCard.lineColor.value.value;
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
        return this.isHighContrast ? this.foregroundColor : this.lineColor;
    }
}

