export interface PlanTarget {
    landRowID: number;
    landPlotID: number;
    graftedPlantID: number;
    plantLotID: number;
    plantID: number;
}

interface PlantOption {
    plantId: number;
    plantName: string;
}

interface PlantLotOption {
    plantLotId: number;
    plantLotName: string;
}

interface GraftedPlantOption {
    graftedPlantId: number;
    graftedPlantName: string;
}

interface RowOption {
    landRowId: number;
    rowIndex: number;
    plants: PlantOption[];
}

export interface SelectedTarget {
    unit: string;
    landPlotId: number;
    landPlotName: string;
    rows: RowOption[];
    plants: PlantOption[];
    plantLots: PlantLotOption[];
    graftedPlants: GraftedPlantOption[];
}