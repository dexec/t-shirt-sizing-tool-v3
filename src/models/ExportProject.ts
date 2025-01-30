import { useBucketContainer } from "@/stores/bucketContainer";
import { useEintragContainer } from "@/stores/eintragContainer";
import { Aufschlag } from "@/models/Aufschlag";
import { Zwischensumme } from "@/models/Zwischensumme";
import { usePaketContainer } from "@/stores/paketContainer";
import { useKonfigContainer } from "@/stores/konfigContainer";
import {useVergleicheStore} from "@/stores/vergleiche";

export class ExportProject {
  private readonly _buckets: { name: string }[] = [];
  private readonly _pakete: {
    id: number,
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    bucket: string | null,
    schaetzung: number | null,
    open: boolean
  }[] = [];
  private readonly _paketeTree: { key: number, children: number[] }[] = [];
  private readonly _eintraege: { bezeichnung: string, aufwandRelativ?: number, aufwandAbsolut?: number }[] = [];
  private projektKonfig: {
    projektname: string,
    bucketmodus: boolean,
    nachkommastellen: number
  };
  private _checkboxIds:number[]=[]

  constructor() {
    this.projektKonfig = {
      projektname: "",
      bucketmodus: true,
      nachkommastellen: 2
    };
    this.saveBuckets();
    this.saveEintraege();
    this.savePakete();
    this.saveProjekt();
    this.saveCheckboxIds();
  }

  public createFile(): Blob {
    const mergedObjects: {
      projektKonfig: { projektname: string, bucketmodus: boolean, nachkommastellen: number}
      buckets: { name: string }[],
      checkboxIds: number[],
      pakete: {
        id: number,
        ticket_nr: string,
        thema: string,
        beschreibung: string,
        bucket: string | null,
        schaetzung: number | null,
        open: boolean
      }[],
      paketeTree: { key: number, children: number[] }[],
      eintraege: { bezeichnung: string, aufwandRelativ?: number, aufwandAbsolut?: number }[]
    }
      = {
      projektKonfig: this.projektKonfig,
      buckets: this._buckets,
      checkboxIds: this._checkboxIds,
      pakete: this._pakete,
      paketeTree: this._paketeTree,
      eintraege: this._eintraege
    };
    return new Blob([JSON.stringify(mergedObjects)], { type: "application/json" });
  }


  private saveBuckets() {
    const bucketContainer = useBucketContainer();
    bucketContainer.bucketsAsSortedArray.forEach(bucket => {
      this._buckets.push({ name: bucket.name });
    });
  }

  private saveEintraege() {
    const eintragContainer = useEintragContainer();
    eintragContainer.eintraege.forEach(eintrag => {
      if (!["Startsumme", "Endsumme"].includes(eintrag.bezeichnung)) {
        if (eintrag instanceof Aufschlag) {
          if (eintrag.isAufwandRelativBase)
            this._eintraege.push({ bezeichnung: eintrag.bezeichnung, aufwandRelativ: eintrag.aufwandRelativ });
          else this._eintraege.push({ bezeichnung: eintrag.bezeichnung, aufwandAbsolut: eintrag.aufwandAbsolut });
        }
        if (eintrag instanceof Zwischensumme) {
          this._eintraege.push({ bezeichnung: eintrag.bezeichnung });
        }
      }
    });
  }

  private savePakete() {
    const paketContainer = usePaketContainer();
    const stack = [...paketContainer.paketeAsTreeView];
    while (stack.length > 0) {
      const aktuellesPaket = stack.shift()!;
      this._pakete.push({
        id: aktuellesPaket.id,
        ticket_nr: aktuellesPaket.ticket_nr,
        thema: aktuellesPaket.thema,
        beschreibung: aktuellesPaket.beschreibung,
        bucket: aktuellesPaket.bucket ? aktuellesPaket.bucket.name : null,
        schaetzung: aktuellesPaket.schaetzung,
        open: aktuellesPaket.open
      });
      if (!aktuellesPaket.open) {
        stack.unshift(...aktuellesPaket.children);
      }
      if (aktuellesPaket.children.length > 0) {
        const childrenIds: number[] = [...aktuellesPaket.children.map(child => child.id)];
        this._paketeTree.push({ key: aktuellesPaket.id, children: childrenIds });
      }
    }
  }

  private saveProjekt() {
    const konfigContainer = useKonfigContainer();
    this.projektKonfig = {
      projektname: konfigContainer.projektname,
      bucketmodus: konfigContainer.bucketmodus,
      nachkommastellen: konfigContainer.nachkommastellen
    };
  }

  private saveCheckboxIds() {
    const vergleicheStore =useVergleicheStore();
    this._checkboxIds = vergleicheStore.checkboxSelectedIds;
  }
}