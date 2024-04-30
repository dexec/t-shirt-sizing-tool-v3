import type {Bucket} from "@/models/Bucket";

export class Paket {
    private static _idCounter: number = 0
    private readonly _id: number
    private _ticket_nr: string
    private _thema: string
    private _beschreibung: string
    private _bucket: Bucket | null
    private _schaetzung: number | null
    private _open: boolean
    private _lvl: number
    private _parent: Paket | null
    private _children: Paket[]

    constructor(ticket_nr: string, thema: string, beschreibung: string, bucket: Bucket | null, schaetzung: number | null, open: boolean, lvl: number, parent: Paket | null, children: Paket[], id?: number) {
        if (id != null) {
            this._id = id;
            if (Paket._idCounter < id) Paket._idCounter = id
        } else this._id = Paket._idCounter;
        Paket._idCounter++;
        this._ticket_nr = ticket_nr;
        this._thema = thema;
        this._beschreibung = beschreibung;
        this._bucket = bucket;
        this._schaetzung = schaetzung;
        this._open = open;
        this._lvl = lvl;
        this._parent = parent;
        this._children = children;
    }


    static set idCounter(value: number) {
        this._idCounter = value;
    }

    get id(): number {
        return this._id;
    }


    get ticket_nr(): string {
        return this._ticket_nr;
    }

    set ticket_nr(value: string) {
        this._ticket_nr = value;
    }

    get thema(): string {
        return this._thema;
    }

    set thema(value: string) {
        this._thema = value;
    }

    get beschreibung(): string {
        return this._beschreibung;
    }

    set beschreibung(value: string) {
        this._beschreibung = value;
    }

    get bucket(): Bucket | null {
        return this._bucket;
    }

    set bucket(value: Bucket | null) {
        this._bucket = value;
    }


    get schaetzung(): number | null {
        return this._schaetzung;
    }

    set schaetzung(value: number | null) {
        this._schaetzung = value;
    }

    get open(): boolean {
        return this._open;
    }

    set open(value: boolean) {
        this._open = value;
    }

    get lvl(): number {
        return this._lvl;
    }

    set lvl(value: number) {
        this._lvl = value;
    }

    get parent(): Paket | null {
        return this._parent;
    }

    set parent(value: Paket | null) {
        this._parent = value;
    }

    get children(): Paket[] {
        return this._children;
    }

    set children(value: Paket[]) {
        this._children = value;
    }

    public zurRechnungFreigegeben(): boolean {
        return this.schaetzung != null;
    }
}
