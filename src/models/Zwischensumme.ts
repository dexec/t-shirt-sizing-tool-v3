import {AbstrakterEintrag} from "@/models/AbstrakterEintrag";

export class Zwischensumme extends AbstrakterEintrag {
    private _vorigerAbschnittAufschlag: number;
    private _vorigerAbschnittAufwand: number;
    private _zwischensummeAufwand: number;

    constructor(bezeichnung: string, anteilGesamtprojekt: number, vorigerAbschnittAufschlag: number, vorigerAbschnittAufwand: number, zwischensummeAufwand: number) {
        super(bezeichnung, zwischensummeAufwand == 0 ? 0 : vorigerAbschnittAufwand / zwischensummeAufwand, anteilGesamtprojekt);
        this._vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
        this._vorigerAbschnittAufwand = vorigerAbschnittAufwand;
        this._zwischensummeAufwand = zwischensummeAufwand;
    }

    get vorigerAbschnittAufschlag(): number {
        return this._vorigerAbschnittAufschlag;
    }

    set vorigerAbschnittAufschlag(value: number) {
        this._vorigerAbschnittAufschlag = value;
    }

    get vorigerAbschnittAufwand(): number {
        return this._vorigerAbschnittAufwand;
    }

    set vorigerAbschnittAufwand(value: number) {
        this._vorigerAbschnittAufwand = value;
    }

    get zwischensummeAufwand(): number {
        return this._zwischensummeAufwand;
    }

    set zwischensummeAufwand(value: number) {
        this._zwischensummeAufwand = value;
    }
}