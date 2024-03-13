import {AbstrakterEintrag} from "@/models/AbstrakterEintrag";

export class Zwischensumme extends AbstrakterEintrag {
    private _vorigerAbschnittAufwandRelativ: number;
    private _vorigerAbschnittAufwandAbsolut: number;
    private _zwischensummeAufwand: number;

    constructor(bezeichnung: string, anteilGesamtprojekt: number, vorigerAbschnittAufwandRelativ: number, vorigerAbschnittAufwandAbsolut: number, zwischensummeAufwand: number) {
        super(bezeichnung, zwischensummeAufwand == 0 ? 0 : vorigerAbschnittAufwandAbsolut / zwischensummeAufwand, anteilGesamtprojekt);
        this._vorigerAbschnittAufwandRelativ = vorigerAbschnittAufwandRelativ;
        this._vorigerAbschnittAufwandAbsolut = vorigerAbschnittAufwandAbsolut;
        this._zwischensummeAufwand = zwischensummeAufwand;
    }

    get vorigerAbschnittAufwandRelativ(): number {
        return this._vorigerAbschnittAufwandRelativ;
    }

    set vorigerAbschnittAufwandRelativ(value: number) {
        this._vorigerAbschnittAufwandRelativ = value;
    }

    get vorigerAbschnittAufwandAbsolut(): number {
        return this._vorigerAbschnittAufwandAbsolut;
    }

    set vorigerAbschnittAufwandAbsolut(value: number) {
        this._vorigerAbschnittAufwandAbsolut = value;
    }

    get zwischensummeAufwand(): number {
        return this._zwischensummeAufwand;
    }

    set zwischensummeAufwand(value: number) {
        this._zwischensummeAufwand = value;
    }
}