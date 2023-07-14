export class Projekt {
    private _projektname: string
    private _projektbeschreibung: string
    private _bucketmodus: boolean


    constructor(projektname: string, projektbeschreibung: string, bucketmodus: boolean) {
        this._projektname = projektname;
        this._projektbeschreibung = projektbeschreibung;
        this._bucketmodus = bucketmodus;
    }


    get projektname(): string {
        return this._projektname;
    }

    set projektname(value: string) {
        this._projektname = value;
    }

    get projektbeschreibung(): string {
        return this._projektbeschreibung;
    }

    set projektbeschreibung(value: string) {
        this._projektbeschreibung = value;
    }

    get bucketmodus(): boolean {
        return this._bucketmodus;
    }

    set bucketmodus(value: boolean) {
        this._bucketmodus = value;
    }
}