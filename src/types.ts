"use strict";
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export interface RouteData {
    origin: string;
    originLat: number;
    originLng: number;
    destination: string;
    destLat: number;
    destLng: number;
    lineWidth: number;
    legendValue: string;
    selectionId?: ISelectionId;
}

