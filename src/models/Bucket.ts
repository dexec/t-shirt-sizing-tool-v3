export class Bucket {

    private readonly _id: number
    private static  _idCounter: number = 0
    constructor(name: string, id?: number) {
        if (id != null) this._id = id;
        else this._id = Bucket._idCounter++;
        this._name = name;
    }

    private _name: string

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): number {
        return this._id;
    }
}

