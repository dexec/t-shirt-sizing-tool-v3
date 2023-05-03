export abstract class AbstrakterEintrag {
  private _bezeichnung: string;
  private _anteilZwischensumme: number;
  private _anteilGesamtprojekt: number;


  protected constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number) {
    this._bezeichnung = bezeichnung;
    this._anteilZwischensumme = anteilZwischensumme;
    this._anteilGesamtprojekt = anteilGesamtprojekt;
  }

  get bezeichnung(): string {
    return this._bezeichnung;
  }

  set bezeichnung(value: string) {
    this._bezeichnung = value;
  }

  get anteilZwischensumme(): number {
    return this._anteilZwischensumme;
  }

  set anteilZwischensumme(value: number) {
    this._anteilZwischensumme = value;
  }

  get anteilGesamtprojekt(): number {
    return this._anteilGesamtprojekt;
  }

  set anteilGesamtprojekt(value: number) {
    this._anteilGesamtprojekt = value;
  }
}