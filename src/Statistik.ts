import type {Bucket} from "@/Bucket";

export class Statistik {
    private _bucket: Bucket
    private _anzahlGeschaetzt: number
    private _anzahlUngeschaetzt: number
    private _anzahlGesamt: number
    private _min: number | null
    private _max: number | null
    private _median: number | null
    private _durchschnitt: number | null
    private _anteilAnzahl: number | null
    private _summeSchaetzungen:number |null
    private _summeDurchschnitt:number |null
    private _summeMedian: number|null


    constructor(bucket: Bucket, anzahlGeschaetzt: number, anzahlUngeschaetzt: number, anzahlGesamt: number, min: number | null, max: number | null, median: number | null, durchschnitt: number | null, anteilAnzahl: number | null, summeSchaetzungen: number | null, summeDurchschnitt: number | null, summeMedian: number | null) {
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

    get min(): number | null {
        return this._min;
    }

    set min(value: number | null) {
        this._min = value;
    }

    get max(): number | null {
        return this._max;
    }

    set max(value: number | null) {
        this._max = value;
    }

    get median(): number | null {
        return this._median;
    }

    set median(value: number | null) {
        this._median = value;
    }

    get durchschnitt(): number | null {
        return this._durchschnitt;
    }

    set durchschnitt(value: number | null) {
        this._durchschnitt = value;
    }

    get anteilAnzahl(): number | null {
        return this._anteilAnzahl;
    }

    set anteilAnzahl(value: number | null) {
        this._anteilAnzahl = value;
    }

    get summeSchaetzungen(): number | null {
        return this._summeSchaetzungen;
    }

    set summeSchaetzungen(value: number | null) {
        this._summeSchaetzungen = value;
    }

    get summeDurchschnitt(): number | null {
        return this._summeDurchschnitt;
    }

    set summeDurchschnitt(value: number | null) {
        this._summeDurchschnitt = value;
    }

    get summeMedian(): number | null {
        return this._summeMedian;
    }

    set summeMedian(value: number | null) {
        this._summeMedian = value;
    }
}