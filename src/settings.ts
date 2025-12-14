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
 * Origin Bubbles Settings Card
 */
export class OriginBubblesCard extends formattingSettings.Card {
    name: string = "originBubbles";
    displayName: string = "Origin Bubbles";

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 2
    });

    slices: Array<formattingSettings.Slice> = [this.bubbleSize];
}

/**
 * Destination Bubbles Settings Card
 */
export class DestinationBubblesCard extends formattingSettings.Card {
    name: string = "destinationBubbles";
    displayName: string = "Destination Bubbles";

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 2
    });

    slices: Array<formattingSettings.Slice> = [this.bubbleSize];
}

/**
 * Map Settings Card
 */
export class MapSettingsCard extends formattingSettings.Card {
    name: string = "mapSettings";
    displayName: string = "Map";

    autoZoom = new formattingSettings.ToggleSwitch({
        name: "autoZoom",
        displayName: "Auto zoom",
        description: "Automatically recenter map to show displayed points when data changes",
        value: true
    });

    slices: Array<formattingSettings.Slice> = [this.autoZoom];
}

/**
 * Visual settings model class
 */
export class VisualFormattingSettingsModel extends formattingSettings.Model {
    routeSettingsCard = new RouteSettingsCard();
    originBubblesCard = new OriginBubblesCard();
    destinationBubblesCard = new DestinationBubblesCard();
    mapSettingsCard = new MapSettingsCard();

    cards: formattingSettings.Card[] = [
        this.routeSettingsCard,
        this.originBubblesCard,
        this.destinationBubblesCard,
        this.mapSettingsCard
    ];
}
