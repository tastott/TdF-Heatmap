
export class Location {
    Latitude: number;
    Longitude: number;
}

export class HeatmapViewModel{
    constructor(data: { Location: Location; Magnitude: number; }[]) {
        this.Data = data;

    }

    Data: {
        Location: Location;
        Magnitude: number;
    }[];
} 