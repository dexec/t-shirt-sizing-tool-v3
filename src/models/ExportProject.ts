import { useBucketsStore } from "@/stores/buckets";
import { useEintraegeStore } from "@/stores/eintraege";
import { Eintrag } from "@/models/Eintrag";
import { Zwischensumme } from "@/models/Zwischensumme";
import { usePaketeStore } from "@/stores/pakete";
import { useProjektStore } from "@/stores/projekt";
import {useVergleicheStore} from "@/stores/vergleiche";

export class ExportProject {
  private readonly _buckets: { id:number, name: string }[] = [];
  private readonly _pakete: {
    id: number,
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    komponente: string,
    bucket: string | null,
    schaetzung: number | null,
    open: boolean
  }[] = [];
  private readonly _paketeTree: { key: number, children: number[] }[] = [];
  private readonly _eintraege: { bezeichnung: string, aufwandRelativ?: number, aufwandAbsolut?: number }[] = [];
  private _projekt: {
    projektname: string,
    bucketmodus: boolean,
    nachkommastellen: number
  };
  private _checkboxIds:number[]=[]

  constructor() {
    this._projekt = {
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
      projekt: { projektname: string, bucketmodus: boolean}
      buckets: { name: string }[],
      checkboxIds: number[],
      pakete: {
        id: number,
        ticket_nr: string,
        thema: string,
        beschreibung: string,
        komponente: string,
        bucket: string | null,
        schaetzung: number | null,
        open: boolean
      }[],
      paketeTree: { key: number, children: number[] }[],
      eintraege: { bezeichnung: string, aufwandRelativ?: number, aufwandAbsolut?: number }[]
    }
      = {
      projekt: this._projekt,
      buckets: this._buckets,
      checkboxIds: this._checkboxIds,
      pakete: this._pakete,
      paketeTree: this._paketeTree,
      eintraege: this._eintraege
    };
    return new Blob([JSON.stringify(mergedObjects)], { type: "application/json" });
  }


  private saveBuckets() {
    const bucketStore = useBucketsStore();
    bucketStore.bucketsAsSortedArray.forEach(bucket => {
      this._buckets.push({ id:bucket.id, name: bucket.name });
    });
  }

  private saveEintraege() {
    const eintraegeStore = useEintraegeStore();
    eintraegeStore.eintraege.forEach(eintrag => {
      if (!["Startsumme", "Endsumme"].includes(eintrag.bezeichnung)) {
        if (eintrag instanceof Eintrag) {
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
    const paketeStore = usePaketeStore();
    const stack = [...paketeStore.paketeAsTreeView];
    while (stack.length > 0) {
      const aktuellesPaket = stack.shift()!;
      this._pakete.push({
        id: aktuellesPaket.id,
        ticket_nr: aktuellesPaket.ticket_nr,
        thema: aktuellesPaket.thema,
        beschreibung: aktuellesPaket.beschreibung,
        komponente: aktuellesPaket.komponente,
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
    const projektStore = useProjektStore();
    this._projekt = {
      projektname: projektStore.projektname,
      bucketmodus: projektStore.bucketmodus,
      nachkommastellen: projektStore.nachkommastellen
    };
  }

  private saveCheckboxIds() {
    const vergleicheStore =useVergleicheStore();
    this._checkboxIds = vergleicheStore.checkboxSelectedIds;
  }
}