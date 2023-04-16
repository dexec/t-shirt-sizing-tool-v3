export class Paket {
  private _id: number
  private _ticket_nr: string | null
  private _thema: string | null
  private _beschreibung: string | null
  private _komponente: string | null
  private _bucket: string | null
  private _schaetzung: number | null
  private _open: boolean | null
  private _lvl: number
  private _parent: Paket | null
  private _children: Paket[]


  constructor(id: number, ticket_nr: string | null, thema: string | null, beschreibung: string | null, komponente: string | null, bucket: string | null, schaetzung: number | null, open: boolean | null, lvl: number, parent: Paket | null, children: Paket[]) {
    this._id = id;
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


  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get ticket_nr(): string | null {
    return this._ticket_nr;
  }

  set ticket_nr(value: string | null) {
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

  get bucket(): string | null {
    return this._bucket;
  }

  set bucket(value: string | null) {
    this._bucket = value;
  }

  get schaetzung(): number | null {
    return this._schaetzung;
  }

  set schaetzung(value: number | null) {
    this._schaetzung = value;
  }

  get open(): boolean | null {
    return this._open;
  }

  set open(value: boolean | null) {
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
