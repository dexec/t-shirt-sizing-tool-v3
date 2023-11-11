export class Projekt {
    private _projektname: string
    private _bucketmodus: boolean
    private _nachkommastellen: number

    constructor(projektname: string, bucketmodus: boolean, nachkommastellen: number) {
        this._projektname = projektname;
        this._bucketmodus = bucketmodus;
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

    get nachkommastellen(): number {
        return this._nachkommastellen;
    }

    set nachkommastellen(value: number) {
        this._nachkommastellen = value;
    }
}