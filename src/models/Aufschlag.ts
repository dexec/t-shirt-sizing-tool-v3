import { AbstrakterEintrag } from "@/models/AbstrakterEintrag";
import { Zwischensumme } from "@/models/Zwischensumme";

export class Aufschlag extends AbstrakterEintrag {

  private _aufwandRelativ: number;
  private _aufwandAbsolut: number;
  private _isAufwandRelativBase: boolean;
  private _basisZwischensumme: Zwischensumme;
  private _naechsteZwischensumme: Zwischensumme;


  constructor(bezeichnung: string, anteilZwischensumme: number, anteilGesamtprojekt: number, aufwandRelativ: number, aufwandAbsolut: number, isAufwandRelativBase: boolean, basisZwischensumme: Zwischensumme | null, naechsteZwischensumme: Zwischensumme | null) {
    super(bezeichnung, anteilZwischensumme, anteilGesamtprojekt);
    this._aufwandRelativ = aufwandRelativ;
    this._aufwandAbsolut = aufwandAbsolut;
    this._isAufwandRelativBase = isAufwandRelativBase;
    if (basisZwischensumme == null) {
      this._basisZwischensumme = new Zwischensumme("", 0, 0, 0, 0);
    } else this._basisZwischensumme = basisZwischensumme;
    if (naechsteZwischensumme == null) {
      this._naechsteZwischensumme = new Zwischensumme("", 0, 0, 0, 0);
    } else this._naechsteZwischensumme = naechsteZwischensumme;
  }

  get aufwandRelativ(): number {
    return this._aufwandRelativ;
  }

  set aufwandRelativ(value: number) {
    this._aufwandRelativ = value;
  }

  get aufwandAbsolut(): number {
    return this._aufwandAbsolut;
  }

  set aufwandAbsolut(value: number) {
    this._aufwandAbsolut = value;
  }

  get isAufwandRelativBase(): boolean {
    return this._isAufwandRelativBase;
  }

  set isAufwandRelativBase(value: boolean) {
    this._isAufwandRelativBase = value;
  }

  get basisZwischensumme(): Zwischensumme {
    return this._basisZwischensumme;
  }

  set basisZwischensumme(value: Zwischensumme) {
    this._basisZwischensumme = value;
  }

  get naechsteZwischensumme(): Zwischensumme {
    return this._naechsteZwischensumme;
  }

  set naechsteZwischensumme(value: Zwischensumme) {
    this._naechsteZwischensumme = value;
  }
}