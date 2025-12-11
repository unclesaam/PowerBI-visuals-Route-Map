"use strict";
import {RouteData} from "./types";

export class ValidationUtils {
    public static isValidLatitude(lat: number): boolean {
        return !isNaN(lat) && lat >= -90 && lat <= 90;
    }

    public static isValidLongitude(lng: number): boolean {
        return !isNaN(lng) && lng >= -180 && lng <= 180;
    }

    public static isValidRouteData(route: RouteData): boolean {
        return this.isValidLatitude(route.originLat) &&
            this.isValidLatitude(route.destLat) &&
            this.isValidLongitude(route.originLng) &&
            this.isValidLongitude(route.destLng);
    }
}

