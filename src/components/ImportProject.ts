import {Bucket} from "@/Bucket";
import {Paket} from "@/Paket";
import type {AbstrakterEintrag} from "@/AbstrakterEintrag";
import {Zwischensumme} from "@/Zwischensumme";
import {Eintrag} from "@/Eintrag";

export class ImportProject {
    private static instance: ImportProject
    private _buckets: Bucket[] = []
    private _pakete: Paket[] = []
    private _eintraege: AbstrakterEintrag[] = []

    public static getInstance(): ImportProject {
        if (!ImportProject.instance) {
            ImportProject.instance = new ImportProject()
        }
        return ImportProject.instance;
    }

    public initialize(fileContents: string) {
        const jsonfile = JSON.parse(fileContents);
        this.fileToBucketArray(jsonfile.buckets);
        this.fileToPaketeArray(jsonfile.pakete, jsonfile.paketeTree);
        this.fileToEintrageArray(jsonfile.eintraege);
    }

    private fileToPaketeArray(paketefromFile: any[], paketeTree: any[]): void {
        for (const paketFromFile of paketefromFile) {
            this._pakete.push(new Paket(paketFromFile.ticket_nr, paketFromFile.thema, paketFromFile.beschreibung, paketFromFile.komponente, paketFromFile.bucket ? this._buckets.find(bucket => bucket.name == paketFromFile.bucket)! : null, paketFromFile.schaetzung, paketFromFile.open, 0, null, [], paketFromFile.id));
        }
        this.setPaketeTreeStructure(paketeTree);
        this.setPaketeLevelAndSchaetzung();
    }

    private setPaketeTreeStructure(paketeTree: any[]): void {
        this._pakete.forEach(paketFromPakete => {
            for (const paketFromTree of paketeTree) {
                if (paketFromTree.key == paketFromPakete.id) {
                    for (const paketChildId of paketFromTree.children) {
                        const paketChild = this._pakete.find(paket => paket.id == paketChildId)!;
                        paketChild.parent = paketFromPakete;
                        paketFromPakete.children.push(paketChild);
                    }
                }
            }
        });
    }

    private setPaketeLevelAndSchaetzung(): void {
        this._pakete.forEach(paketFromPakete => {
            let lvl = 0;
            let parent = paketFromPakete.parent;
            while (parent) {
                lvl++;
                parent = parent.parent;
            }
            paketFromPakete.lvl = lvl;
            if (paketFromPakete.children.length > 0) paketFromPakete.schaetzung = paketFromPakete.children.filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0);
        });
    }

    private fileToBucketArray(bucketsFromFile: any[]): void {
        for (const bucketFromFile of bucketsFromFile) {
            const newBucket = new Bucket(bucketFromFile.name);
            this._buckets.push(newBucket);
        }
    }

    private fileToEintrageArray(eintrageFromFile: any[]): void {
        this._eintraege.unshift(new Zwischensumme("STARTSUMME", 0, 0, 0, 0));
        let aktuelleZwischensumme = this._eintraege[0] as Zwischensumme;
        for (const eintrag of eintrageFromFile) {
            if (eintrag.bezeichnung == "ZWISCHENSUMME") {
                const newZwischsumme = new Zwischensumme(eintrag.bezeichnung, 0, 0, 0, 0)
                aktuelleZwischensumme = newZwischsumme;
                this._eintraege.push(newZwischsumme);
            } else if (eintrag.aufschlagWert) this._eintraege.push(new Eintrag(eintrag.bezeichnung, 0, 0, eintrag.aufschlagWert, 0, true, aktuelleZwischensumme));
            else if (eintrag.aufwandWert) this._eintraege.push(new Eintrag(eintrag.bezeichnung, 0, 0, 0, eintrag.aufwandWert, false, aktuelleZwischensumme));
        }
        this._eintraege.push(new Zwischensumme("ENDSUMME", 0, 0, 0, 0))
    }

    public getEintrageArray(): AbstrakterEintrag[] {
        return this._eintraege;
    }

    public getBucketMap(): Map<number, Bucket> {
        const bucketsAsMap = new Map<number, Bucket>();
        for (const bucket of this._buckets) {
            bucketsAsMap.set(bucket.id, bucket);
        }
        return bucketsAsMap
    }

    public getBucketArray(): Bucket[] {
        return this._buckets
    }

    public getPaketeMap(): Map<number, Paket> {
        const result = new Map<number, Paket>();
        for (const paket of this._pakete) {
            result.set(paket.id, paket)
        }
        return result;
    }

    public getPaketeTreeView(): Paket[] {
        const result: Paket[] = [];
        const stackForTreeView: Paket[] = []
        for (const paket of this._pakete) {
            if (paket.lvl == 0) stackForTreeView.push(paket)
        }
        while (stackForTreeView.length > 0) {
            const aktuellesPaket = stackForTreeView.shift();
            if (aktuellesPaket != undefined) {
                if (aktuellesPaket.children.length > 0) {
                    for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                        if (aktuellesPaket.open)
                            stackForTreeView.unshift(aktuellesPaket.children[i]);
                    }
                }
                result.push(aktuellesPaket);
            }
        }
        return result;
    }
}