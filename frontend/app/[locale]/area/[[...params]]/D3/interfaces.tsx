export interface InterpResponse {
    interpolated_values: InterpolatedValue[];
}

export interface InterpolatedValue {
    platform: string;
    data:     Datum[];
}

export interface Datum {
    cent_time:  string;
    start_time: string;
    end_time:   string;
    Dx:         number;
    Dy:         number;
    Dtot:       number;
    velx:       number;
    vely:       number;
    veltot:     number;
    error:      number;
}