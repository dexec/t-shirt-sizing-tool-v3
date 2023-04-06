export class Zwischensumme {
    vorigerAbschnittAufschlag: number
    vorigerAbschnittAufwand: number
    zwischensummeAufwand: number

    constructor(vorigerAbschnittAufschlag: number, vorigerAbschnittAufwand: number, zwischensummeAufwand: number) {
        this.vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
        this.vorigerAbschnittAufwand = vorigerAbschnittAufwand;
        this.zwischensummeAufwand = zwischensummeAufwand;
    }
}