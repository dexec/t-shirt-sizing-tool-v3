export abstract class AbstrakterAufschlag {
  bezeichnung: string
  anteilZwischensumme:number
  anteilGesamtprojekt:number


  protected constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number) {
    this.bezeichnung = bezeichnung;
    this.anteilZwischensumme = anteilZwischensumme;
    this.anteilGesamtprojekt = anteilGesamtprojekt;
  }
}