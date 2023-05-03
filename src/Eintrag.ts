import {AbstrakterEintrag} from "@/AbstrakterEintrag";
import type {Zwischensumme} from "@/Zwischensumme";

export class Eintrag extends AbstrakterEintrag {
    private _aufschlagWert: number;
    private _aufwandWert: number;
    private _isAufschlagBase: boolean;
    private _referenzierteZwischensumme: Zwischensumme;


    constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, aufschlagWert: number, aufwandWert: number, isAufschlagBase: boolean, referenzierteZwischensumme: Zwischensumme) {
        super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
        this._aufschlagWert = aufschlagWert;
        this._aufwandWert = aufwandWert;
        this._isAufschlagBase = isAufschlagBase;
        this._referenzierteZwischensumme = referenzierteZwischensumme;
    }

    get aufschlagWert(): number {
        return this._aufschlagWert;
    }

    set aufschlagWert(value: number) {
        this._aufschlagWert = value;
    }

    get aufwandWert(): number {
        return this._aufwandWert;
    }

    set aufwandWert(value: number) {
        this._aufwandWert = value;
    }

    get isAufschlagBase(): boolean {
        return this._isAufschlagBase;
    }

    set isAufschlagBase(value: boolean) {
        this._isAufschlagBase = value;
    }

    get referenzierteZwischensumme(): Zwischensumme {
        return this._referenzierteZwischensumme;
    }

    set referenzierteZwischensumme(value: Zwischensumme) {
        this._referenzierteZwischensumme = value;
    }
}