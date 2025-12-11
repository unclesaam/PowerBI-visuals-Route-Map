"use strict";
import * as L from "leaflet";

export class MapManager {
    private map: L.Map;
    private tileLayer: L.TileLayer;
    private routeGroup: L.LayerGroup;
    private mapContainer: HTMLElement;

    constructor(mapContainer: HTMLElement) {
        this.mapContainer = mapContainer;
        this.initializeMap();
    }

    private initializeMap(): void {
        this.map = L.map(this.mapContainer, {
            zoomControl: true,
            attributionControl: true
        }).setView([0, 0], 2);

        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        this.routeGroup = L.layerGroup().addTo(this.map);
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

    public fitBounds(bounds: L.LatLngBounds): void {
        if (bounds.isValid()) {
            this.map.fitBounds(bounds);
        }
    }

    public clearRoutes(): void {
        this.routeGroup.clearLayers();
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

