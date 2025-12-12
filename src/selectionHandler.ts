"use strict";
import powerbi from "powerbi-visuals-api";

export class SelectionHandler {
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private selectedIds: powerbi.extensibility.ISelectionId[] = [];
    private contextMenuShown: boolean = false;

    constructor(selectionManager: powerbi.extensibility.ISelectionManager) {
        this.selectionManager = selectionManager;
    }

    public getSelectedIds(): powerbi.extensibility.ISelectionId[] {
        return this.selectedIds;
    }

    public getContextMenuShown(): boolean {
        return this.contextMenuShown;
    }

    public async handleSelection(
        selectionId: powerbi.extensibility.ISelectionId | powerbi.extensibility.ISelectionId[],
        multiSelect: boolean
    ): Promise<powerbi.extensibility.ISelectionId[]> {
        this.selectedIds = await this.selectionManager.select(selectionId, multiSelect);
        return this.selectedIds;
    }

    public async clearSelection(): Promise<void> {
        await this.selectionManager.clear();
        this.selectedIds = [];
    }

    public async showContextMenu(
        selectionId: powerbi.extensibility.ISelectionId | {},
        position: { x: number; y: number }
    ): Promise<void> {
        this.contextMenuShown = true;
        await this.selectionManager.showContextMenu(selectionId, position)
            .finally(() => this.contextMenuShown = false);
    }
}

