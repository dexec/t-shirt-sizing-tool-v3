import {useBucketsStore} from "@/stores/buckets";
import {useEintraegeStore} from "@/stores/eintraege";
import {Eintrag} from "@/Eintrag";
import {Zwischensumme} from "@/Zwischensumme";
import {usePaketeStore} from "@/stores/pakete";

export class ExportProject {
    private static instance: ExportProject
    private _buckets: { name: string }[] = []
    private _pakete: {
        id: number,
        ticket_nr: string,
        thema: string,
        beschreibung: string,
        komponente: string,
        bucket: string | null,
        schaetzung: number | null,
        open: boolean
    }[] = []
    private _paketeTree: { key: number, children: number[] }[] = []
    private _eintraege: { bezeichnung: string, aufschlagWert?: number, aufwandWert?: number }[] = []

    public createFile(): Blob {
        const merged = {...this._buckets,...this._pakete,...this._paketeTree,...this._eintraege};
        console.log(merged)
        return new Blob([json], {type: "application/json"});
    }

    public static getInstance(): ExportProject {
        if (!ExportProject.instance) {
            ExportProject.instance = new ExportProject()
        }
        return ExportProject.instance;
    }

    private constructor() {
        this.saveBuckets();
        this.saveEintraege();
        this.savePakete();
    }

    private saveBuckets() {
        const bucketStore = useBucketsStore()
        bucketStore.bucketsAsSortedArray.forEach(bucket => {
            this._buckets.push({name: bucket.name})
        })
    }

    private saveEintraege() {
        const eintraegeStore = useEintraegeStore()
        eintraegeStore.eintraege.forEach(eintrag => {
            if (!["STARTSUMME", "ENDSUMME"].includes(eintrag.bezeichnung)) {
                if (eintrag instanceof Eintrag) {
                    if (eintrag.isAufschlagBase)
                        this._eintraege.push({bezeichnung: eintrag.bezeichnung, aufschlagWert: eintrag.aufschlagWert})
                    else this._eintraege.push({bezeichnung: eintrag.bezeichnung, aufwandWert: eintrag.aufwandWert})
                }
                if (eintrag instanceof Zwischensumme) {
                    this._eintraege.push({bezeichnung: eintrag.bezeichnung})
                }
            }
        })
    }

    private savePakete() {
        const paketeStore = usePaketeStore();
        const stack = [...paketeStore.paketeAsTreeView]
        while (stack.length > 0) {
            const aktuellesPaket = stack.shift()!
            this._pakete.push({
                id: aktuellesPaket.id,
                ticket_nr: aktuellesPaket.ticket_nr,
                thema: aktuellesPaket.thema,
                beschreibung: aktuellesPaket.beschreibung,
                komponente: aktuellesPaket.komponente,
                bucket: aktuellesPaket.bucket ? aktuellesPaket.bucket.name : null,
                schaetzung: aktuellesPaket.schaetzung,
                open: aktuellesPaket.open
            })
            if (!aktuellesPaket.open) {
                stack.unshift(...aktuellesPaket.children.reverse());
            }
            if (aktuellesPaket.children.length > 0) {
                const childrenIds: number[] = [...aktuellesPaket.children.map(child => child.id)]
                this._paketeTree.push({key: aktuellesPaket.id, children: childrenIds})
            }
        }
    }
}