function Paket(id, ticket_nr, thema, beschreibung, komponente, bucket, schaetzung, visible, open, children) {
    this.id = id;
    this.ticket_nr = ticket_nr;
    this.thema = thema;
    this.beschreibung = beschreibung;
    this.komponente = komponente;
    this.bucket = bucket;
    this.schaetzung = schaetzung;
    this.visible = visible;
    this.open = open;
    this.children = children;
}

export default Paket