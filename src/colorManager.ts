"use strict";
import {VisualFormattingSettingsModel} from "./settings";

export class ColorManager {
    private lineColor: string;

    constructor(formattingSettings: VisualFormattingSettingsModel) {
        this.lineColor = formattingSettings.routeSettingsCard.lineColor.value.value;
    }

    public getRouteColor(): string {
        return this.lineColor;
    }
}

