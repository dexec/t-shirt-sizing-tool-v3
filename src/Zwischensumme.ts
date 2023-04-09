import { AbstrakterAufschlag } from "@/AbstrakterAufschlag";

export class Zwischensumme extends AbstrakterAufschlag{
    vorigerAbschnittAufschlag: number
    vorigerAbschnittAufwand: number
    zwischensummeAufwand: number


    constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, vorigerAbschnittAufschlag: number, vorigerAbschnittAufwand: number, zwischensummeAufwand: number) {
        super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
        this.vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
        this.vorigerAbschnittAufwand = vorigerAbschnittAufwand;
        this.zwischensummeAufwand = zwischensummeAufwand;
    }
}