export class Paket {
  id: number
  ticket_nr: string | null
  thema: string | null
  beschreibung: string | null
  komponente: string | null
  bucket: string | null
  schaetzung: number | null
  open: boolean | null
  lvl: number
  parent?: Paket | null
  children: Paket[]

  constructor(id: number, ticket_nr: string | null, thema: string | null, beschreibung: string | null, komponente: string | null, bucket: string | null, schaetzung: number | null, open: boolean | null, lvl: number, parent: Paket | null, children: Paket[]) {
    this.id = id;
    this.ticket_nr = ticket_nr;
    this.thema = thema;
    this.beschreibung = beschreibung;
    this.komponente = komponente;
    this.bucket = bucket;
    this.schaetzung = schaetzung;
    this.open = open;
    this.lvl = lvl;
    this.parent = parent;
    this.children = children;
  }
}
