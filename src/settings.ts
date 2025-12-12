"use strict";

import {formattingSettings} from "powerbi-visuals-utils-formattingmodel";
import {dataViewWildcard} from "powerbi-visuals-utils-dataviewutils";

/**
 * Route Settings Card
 */
export class RouteSettingsCard extends formattingSettings.Card {
    name: string = "routeSettings";
    displayName: string = "Routes";

    lineWidth = new formattingSettings.NumUpDown({
        name: "lineWidth",
        displayName: "Line Width",
        value: 3
    });

    lineColor = new formattingSettings.ColorPicker({
        name: "lineColor",
        displayName: "Line Color",
        value: {value: "#007ACC"},
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule,
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
    });

    slices: Array<formattingSettings.Slice> = [this.lineWidth, this.lineColor];
}

/**
 *  Bubble Settings Card
 */
export class BubbleSettingsCard extends formattingSettings.Card {
    name: string = "bubbleSettings";
    displayName: string = "Bubbles";

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 3
    });

    slices: Array<formattingSettings.Slice> = [this.bubbleSize];
}

/**
 * Visual settings model class
 */
export class VisualFormattingSettingsModel extends formattingSettings.Model {
    routeSettingsCard = new RouteSettingsCard();
    bubbleSettingsCard = new BubbleSettingsCard();

    cards: formattingSettings.Card[] = [
        this.routeSettingsCard,
        this.bubbleSettingsCard
    ];
}
