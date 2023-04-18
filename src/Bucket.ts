export class Bucket {

    private static _idCounter: number = 0
    private readonly _id: number
    private _name: string


    constructor(name: string, id?: number) {
        if (id != null) this._id = id;
        else this._id = Bucket._idCounter++;
        this._name = name;
    }


    static get idCounter(): number {
        return this._idCounter;
    }

    static set idCounter(value: number) {
        this._idCounter = value;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
}

