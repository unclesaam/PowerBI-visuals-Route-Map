"use strict";
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export interface RouteData {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    lineWidth: number;
    selectionId?: ISelectionId;
}

