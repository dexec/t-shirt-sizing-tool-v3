import type {Bucket} from "@/Bucket";

export class Paket {
    private static _idCounter: number = 0
    private readonly _id: number
    private _ticket_nr: string
    private _thema: string | null
    private _beschreibung: string | null
    private _komponente: string | null
    private _bucket: Bucket | null
    private _schaetzung: number
    private _open: boolean
    private _lvl: number
    private _parent: Paket | null
    private _children: Paket[]

    constructor(ticket_nr: string, thema: string | null, beschreibung: string | null, komponente: string | null, bucket: Bucket | null, schaetzung: number, open: boolean, lvl: number, parent: Paket | null, children: Paket[], id?: number) {
        if (id != null) this._id = id;
        else this._id = Paket._idCounter++;
        this._ticket_nr = ticket_nr;
        this._thema = thema;
        this._beschreibung = beschreibung;
        this._komponente = komponente;
        this._bucket = bucket;
        this._schaetzung = schaetzung;
        this._open = open;
        this._lvl = lvl;
        this._parent = parent;
        this._children = children;
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

    get ticket_nr(): string {
        return this._ticket_nr;
    }

    set ticket_nr(value: string) {
        this._ticket_nr = value;
    }

    get thema(): string | null {
        return this._thema;
    }

    set thema(value: string | null) {
        this._thema = value;
    }

    get beschreibung(): string | null {
        return this._beschreibung;
    }

    set beschreibung(value: string | null) {
        this._beschreibung = value;
    }

    get komponente(): string | null {
        return this._komponente;
    }

    set komponente(value: string | null) {
        this._komponente = value;
    }

    get bucket(): Bucket | null {
        return this._bucket;
    }

    set bucket(value: Bucket | null) {
        this._bucket = value;
    }

    get schaetzung(): number {
        return this._schaetzung;
    }

    set schaetzung(value: number) {
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
}