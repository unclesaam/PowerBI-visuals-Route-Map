"use strict";

import {formattingSettings} from "powerbi-visuals-utils-formattingmodel";

/**
 * Legend Settings Card
 */
export class LegendSettings extends formattingSettings.Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });

    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Position",
        value: {value: "Top", displayName: "Top"},
        items: [
            {value: "Top", displayName: "Top"},
            {value: "Bottom", displayName: "Bottom"},
            {value: "Left", displayName: "Left"},
            {value: "Right", displayName: "Right"}
        ]
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Title",
        value: "",
        placeholder: "Enter legend title"
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        value: 8
    });

    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "Title",
        value: true
    });

    name: string = "legend";
    displayName: string = "Legend";
    slices: Array<formattingSettings.Slice> = [
        this.show,
        this.position,
        this.showTitle,
        this.titleText,
        this.fontSize
    ];
}

/**
 * Route Settings Card
 */
export class RouteSettingsCard extends formattingSettings.Card {
    name: string = "routeSettings";
    displayName: string = "Routes";
    slices: Array<formattingSettings.Slice> = [];

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
    });

    constructor() {
        super();
        this.slices.push(this.lineWidth);
        this.slices.push(this.lineColor);
    }
}

/**
 *  Bubble Settings Card
 */
export class BubbleSettingsCard extends formattingSettings.Card {
    name: string = "bubbleSettings";
    displayName: string = "Bubbles";
    slices: Array<formattingSettings.Slice> = [];

    bubbleSize = new formattingSettings.NumUpDown({
        name: "bubbleSize",
        displayName: "Bubble Size",
        value: 3
    });

    constructor() {
        super();
        this.slices.push(this.bubbleSize);
    }
}

/**
 * Visual settings model class
 */
export class VisualFormattingSettingsModel extends formattingSettings.Model {
    legendSettings = new LegendSettings();
    routeSettingsCard = new RouteSettingsCard();
    bubbleSettingsCard = new BubbleSettingsCard();

    cards: formattingSettings.Card[] = [
        this.routeSettingsCard,
        this.bubbleSettingsCard,
        this.legendSettings,
    ];
}
