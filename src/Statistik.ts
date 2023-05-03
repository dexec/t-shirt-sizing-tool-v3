import type {Bucket} from "@/Bucket";

export class Statistik {
    private _bucket: Bucket
    private _anzahlGeschaetzt: number
    private _anzahlUngeschaetzt: number
    private _anzahlGesamt: number
    private _min: number
    private _max: number
    private _median: number
    private _durchschnitt: number
    private _anteilAnzahl: number
    private _summeSchaetzungen:number
    private _summeDurchschnitt:number
    private _summeMedian: number


    constructor(bucket: Bucket, anzahlGeschaetzt: number, anzahlUngeschaetzt: number, anzahlGesamt: number, min: number, max: number, median: number, durchschnitt: number, anteilAnzahl: number, summeSchaetzungen: number, summeDurchschnitt: number, summeMedian: number) {
        this._bucket = bucket;
        this._anzahlGeschaetzt = anzahlGeschaetzt;
        this._anzahlUngeschaetzt = anzahlUngeschaetzt;
        this._anzahlGesamt = anzahlGesamt;
        this._min = min;
        this._max = max;
        this._median = median;
        this._durchschnitt = durchschnitt;
        this._anteilAnzahl = anteilAnzahl;
        this._summeSchaetzungen = summeSchaetzungen;
        this._summeDurchschnitt = summeDurchschnitt;
        this._summeMedian = summeMedian;
    }

    get bucket(): Bucket {
        return this._bucket;
    }

    set bucket(value: Bucket) {
        this._bucket = value;
    }

    get anzahlGeschaetzt(): number {
        return this._anzahlGeschaetzt;
    }

    set anzahlGeschaetzt(value: number) {
        this._anzahlGeschaetzt = value;
    }

    get anzahlUngeschaetzt(): number {
        return this._anzahlUngeschaetzt;
    }

    set anzahlUngeschaetzt(value: number) {
        this._anzahlUngeschaetzt = value;
    }

    get anzahlGesamt(): number {
        return this._anzahlGesamt;
    }

    set anzahlGesamt(value: number) {
        this._anzahlGesamt = value;
    }

    get min(): number {
        return this._min;
    }

    set min(value: number) {
        this._min = value;
    }

    get max(): number {
        return this._max;
    }

    set max(value: number) {
        this._max = value;
    }

    get median(): number {
        return this._median;
    }

    set median(value: number) {
        this._median = value;
    }

    get durchschnitt(): number {
        return this._durchschnitt;
    }

    set durchschnitt(value: number) {
        this._durchschnitt = value;
    }

    get anteilAnzahl(): number {
        return this._anteilAnzahl;
    }

    set anteilAnzahl(value: number) {
        this._anteilAnzahl = value;
    }

    get summeSchaetzungen(): number {
        return this._summeSchaetzungen;
    }

    set summeSchaetzungen(value: number) {
        this._summeSchaetzungen = value;
    }

    get summeDurchschnitt(): number {
        return this._summeDurchschnitt;
    }

    set summeDurchschnitt(value: number) {
        this._summeDurchschnitt = value;
    }

    get summeMedian(): number {
        return this._summeMedian;
    }

    set summeMedian(value: number) {
        this._summeMedian = value;
    }
}