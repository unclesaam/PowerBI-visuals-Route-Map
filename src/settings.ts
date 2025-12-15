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

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true,
        topLevelToggle: true
    });

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 3
    });

    bubbleColor = new formattingSettings.ColorPicker({
        name: "bubbleColor",
        displayName: "Bubble Color",
        value: {value: "#007ACC"},
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule,
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
    });

    topLevelSlice = this.show;
    slices: Array<formattingSettings.Slice> = [this.bubbleSize, this.bubbleColor];
}

/**
 * Destination Bubbles Settings Card
 */
export class DestinationBubblesCard extends formattingSettings.Card {
    name: string = "destinationBubbles";
    displayName: string = "Destination Bubbles";

    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 3
    });

    bubbleColor = new formattingSettings.ColorPicker({
        name: "bubbleColor",
        displayName: "Bubble Color",
        value: {value: "#007ACC"},
        instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule,
        selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals)
    });

    topLevelSlice = this.show;
    slices: Array<formattingSettings.Slice> = [this.bubbleSize, this.bubbleColor];
}

/**
 * Map Settings Card
 */
export class MapSettingsCard extends formattingSettings.Card {
    name: string = "mapSettings";
    displayName: string = "Map";

    mapStyle = new formattingSettings.ItemDropdown({
        name: "mapStyle",
        displayName: "Map Style",
        items: [
            { displayName: "OpenStreetMap Standard", value: "osm-standard" },
            { displayName: "CartoDB Positron (Light)", value: "cartodb-positron" },
            { displayName: "CartoDB Dark Matter", value: "cartodb-dark" },
            { displayName: "ESRI World Street Map", value: "esri-street" },
            { displayName: "ESRI World Imagery", value: "esri-satellite" }
        ],
        value: { displayName: "OpenStreetMap Standard", value: "osm-standard" }
    });

    autoZoom = new formattingSettings.ToggleSwitch({
        name: "autoZoom",
        displayName: "Auto zoom",
        description: "Automatically recenter map to show displayed points when data changes",
        value: true
    });

    zoomButtons = new formattingSettings.ToggleSwitch({
        name: "zoomButtons",
        displayName: "Zoom Buttons",
        description: "Show zoom buttons in the top-left corner of the map",
        value: false
    });

    slices: Array<formattingSettings.Slice> = [this.mapStyle, this.autoZoom, this.zoomButtons];
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
