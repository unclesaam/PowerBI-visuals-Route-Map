"use strict";
import * as L from "leaflet";

/**
 * MapManager handles Leaflet map initialization, tile layers, and route layer management.
 * It also generates curved Bézier paths between origin and destination points.
 */
export class MapManager {
    private map: L.Map;
    private routeGroup: L.LayerGroup;
    private autoZoom: boolean = true;
    private zoomControl: L.Control.Zoom | null = null;

    constructor(mapContainer: HTMLElement, zoomButtons: boolean = false) {
        this.map = L.map(mapContainer, {
            zoomControl: false,
            attributionControl: true
        }).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        this.routeGroup = L.layerGroup().addTo(this.map);

        if (zoomButtons) {
            this.zoomControl = L.control.zoom({ position: 'topleft' });
            this.zoomControl.addTo(this.map);
        }
    }

    public getMap(): L.Map {
        return this.map;
    }

    public getRouteGroup(): L.LayerGroup {
        return this.routeGroup;
    }

    public invalidateSize(): void {
        this.map.invalidateSize();
    }

    public setAutoZoom(enabled: boolean): void {
        this.autoZoom = enabled;
    }

    public fitBounds(bounds: L.LatLngBounds): void {
        if (this.autoZoom && bounds.isValid()) {
            this.map.fitBounds(bounds);
        }
    }

    public clearRoutes(): void {
        this.routeGroup.clearLayers();
    }

    public setZoomButtons(enabled: boolean): void {
        if (enabled && !this.zoomControl) {
            this.zoomControl = L.control.zoom({ position: 'topleft' });
            this.zoomControl.addTo(this.map);
        } else if (!enabled && this.zoomControl) {
            this.map.removeControl(this.zoomControl);
            this.zoomControl = null;
        }
    }

    public getCurvedPathCoordinates(start: [number, number], end: [number, number]): [number, number][] {
        const latlngs: [number, number][] = [];
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const midPoint: [number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
            const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
            const elevation = dist * 0.15;
            const controlPoint: [number, number] = [midPoint[0] + elevation, midPoint[1]];

            const lat = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * controlPoint[0] + t ** 2 * end[0];
            const lng = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * controlPoint[1] + t ** 2 * end[1];
            latlngs.push([lat, lng]);
        }

        return latlngs;
    }
}

