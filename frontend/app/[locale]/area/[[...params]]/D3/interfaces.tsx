export interface InterpResponse {
    interpolated_values: InterpolatedValue[];
}

export interface InterpolatedValue {
    platform: string;
    data:     Datum[];
}

export interface Datum {
    cent_time:  Date;
    start_time: Date;
    end_time:   Date;
    Dx:         number;
    Dy:         number;
    Dtot:       number;
    velx:       number;
    vely:       number;
    veltot:     number;
    error:      number;
}