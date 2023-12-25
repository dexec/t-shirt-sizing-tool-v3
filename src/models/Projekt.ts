export class Projekt {
    private _projektname: string
    private _bucketmodus: boolean
    private _aufschlaegeErklaeren:boolean
    private _nachkommastellen: number


    constructor(projektname: string, bucketmodus: boolean, aufschlaegeErklaeren: boolean, nachkommastellen: number) {
        this._projektname = projektname;
        this._bucketmodus = bucketmodus;
        this._aufschlaegeErklaeren = aufschlaegeErklaeren;
        this._nachkommastellen = nachkommastellen;
    }


    get projektname(): string {
        return this._projektname;
    }

    set projektname(value: string) {
        this._projektname = value;
    }

    get bucketmodus(): boolean {
        return this._bucketmodus;
    }

    set bucketmodus(value: boolean) {
        this._bucketmodus = value;
    }

    get aufschlaegeErklaeren(): boolean {
        return this._aufschlaegeErklaeren;
    }

    set aufschlaegeErklaeren(value: boolean) {
        this._aufschlaegeErklaeren = value;
    }

    get nachkommastellen(): number {
        return this._nachkommastellen;
    }

    set nachkommastellen(value: number) {
        this._nachkommastellen = value;
    }
}