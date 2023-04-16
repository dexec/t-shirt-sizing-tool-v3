import { AbstrakterAufschlag } from "@/AbstrakterAufschlag";
import type { Zwischensumme } from "@/Zwischensumme";

export class Aufschlag extends AbstrakterAufschlag {
  private _aufschlagWert: number | null;
  private _aufwandWert: number | null;
  private _referenzierteZwischensumme: Zwischensumme;

  constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, aufschlagWert: number | null, aufwandWert: number | null, referenzierteZwischensumme: Zwischensumme) {
    super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
    this._aufschlagWert = aufschlagWert;
    this._aufwandWert = aufwandWert;
    this._referenzierteZwischensumme = referenzierteZwischensumme;
  }

  berechneAufwand(): number {
    if (this._aufwandWert) {
      return this._aufwandWert;
    } else if (this._aufschlagWert) {
      return this._aufschlagWert * this._referenzierteZwischensumme.zwischensummeAufwand / 100;
    }
    return 0;
  }

  berechneAufschlag(): number {
    if (this._aufschlagWert) {
      return this._aufschlagWert;
    } else if (this._aufwandWert) {
      return this._aufwandWert / this._referenzierteZwischensumme.zwischensummeAufwand * 100;
    }
    return 0;
  }


  get aufschlagWert(): number | null {
    return this._aufschlagWert;
  }

  get aufwandWert(): number | null {
    return this._aufwandWert;
  }

  set aufschlagWert(value: number | null) {
    this._aufschlagWert = value;
  }

  set aufwandWert(value: number | null) {
    this._aufwandWert = value;
  }

  get referenzierteZwischensumme(): Zwischensumme {
    return this._referenzierteZwischensumme;
  }

  set referenzierteZwischensumme(value: Zwischensumme) {
    this._referenzierteZwischensumme = value;
  }
}