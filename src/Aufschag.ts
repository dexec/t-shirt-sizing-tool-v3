import { AbstrakterAufschlag } from "@/AbstrakterAufschlag";

export class Aufschlag extends AbstrakterAufschlag {
    bezeichnung: string
    aufschlag: number
    aufwand: number


    constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, aufschlag: number, aufwand: number) {
        super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
        this.bezeichnung = bezeichnung;
        this.aufschlag = aufschlag;
        this.aufwand = aufwand;
    }
}