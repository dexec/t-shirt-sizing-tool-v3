import {AbstrakterEintrag} from "@/models/AbstrakterEintrag";
import type {Zwischensumme} from "@/models/Zwischensumme";

export class Eintrag extends AbstrakterEintrag {
    private _aufwandRelativ: number;
    private _aufwandAbsolut: number;
    private _isAufwandRelativBase: boolean;
    private _referenzierteZwischensumme: Zwischensumme;


    constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, aufwandRelativ: number, aufwandAbsolut: number, isAufwandRelativBase: boolean, referenzierteZwischensumme: Zwischensumme) {
        super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
        this._aufwandRelativ = aufwandRelativ;
        this._aufwandAbsolut = aufwandAbsolut;
        this._isAufwandRelativBase = isAufwandRelativBase;
        this._referenzierteZwischensumme = referenzierteZwischensumme;
    }

    get aufwandRelativ(): number {
        return this._aufwandRelativ;
    }

    set aufwandRelativ(value: number) {
        this._aufwandRelativ = value;
    }

    get aufwandAbsolut(): number {
        return this._aufwandAbsolut;
    }

    set aufwandAbsolut(value: number) {
        this._aufwandAbsolut = value;
    }

    get isAufwandRelativBase(): boolean {
        return this._isAufwandRelativBase;
    }

    set isAufwandRelativBase(value: boolean) {
        this._isAufwandRelativBase = value;
    }

    get referenzierteZwischensumme(): Zwischensumme {
        return this._referenzierteZwischensumme;
    }

    set referenzierteZwischensumme(value: Zwischensumme) {
        this._referenzierteZwischensumme = value;
    }
}