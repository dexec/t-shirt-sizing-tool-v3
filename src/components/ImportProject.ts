import {Bucket} from "@/models/Bucket";
import {Paket} from "@/models/Paket";
import type {AbstrakterEintrag} from "@/models/AbstrakterEintrag";
import {Zwischensumme} from "@/models/Zwischensumme";
import {Eintrag} from "@/models/Eintrag";
import {Projekt} from "@/models/Projekt";
import {useBucketsStore} from "@/stores/buckets";
import {useProjektStore} from "@/stores/projekt";
import {useEintraegeStore} from "@/stores/eintraege";
import {usePaketeStore} from "@/stores/pakete";

export class ImportProject {
    private readonly _buckets: Bucket[] = []
    private readonly _pakete: Paket[] = []
    private readonly _eintraege: AbstrakterEintrag[] = []
    private _projekt: Projekt = new Projekt("", "", false,2)

    constructor(fileContents: string) {
        const jsonfile = JSON.parse(fileContents);
        this.fileToProjectData(jsonfile.projekt)
        this.fileToBucketArray(jsonfile.buckets);
        this.fileToPaketeArray(jsonfile.pakete, jsonfile.paketeTree);
        this.fileToEintrageArray(jsonfile.eintraege);
        this.writeProjectStore();
        this.writeEintraegeStore();
        this.writeBucketStoreBucketArray();
        this.writeBucketStoreBucketMap();
        this.writePaketeStorePaketeMap();
        this.writePaketeStorePaketeTreeView();
        this.writePaketeStoreUnsortedPaketeListsSortedByBucketsMap();
    }

    private fileToPaketeArray(paketefromFile: any[], paketeTree: any[]): void {
        for (const paketFromFile of paketefromFile) {
            this._pakete.push(new Paket(paketFromFile.ticket_nr, paketFromFile.thema, paketFromFile.beschreibung, paketFromFile.komponente, paketFromFile.bucket ? this._buckets.find(bucket => bucket.name == paketFromFile.bucket)! : null, paketFromFile.schaetzung, paketFromFile.open, 0, null, [], paketFromFile.id));
        }
        //Nur dev-Zweck
        this.generatePakete(0);
        this.setPaketeTreeStructure(paketeTree);
        this.setPaketeLevelAndSchaetzung();
    }

    private generatePakete(numberPakete: number) {
        for (let i = 0; i < numberPakete; i++) {
            const newPaket = new Paket(i + numberPakete + "", "Testing " + i, "Ticket zum Testen", "Test", null, null, false, 0, null, []);
            this._pakete.push(newPaket);
        }
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
            if(paketFromPakete.children.length>0) {
                let schaetzung: number | null = null;
                for (const paket of paketFromPakete.children) {
                    if (paket.zurRechnungFreigegeben() && paket.schaetzung != null) {
                        schaetzung = (schaetzung ?? 0) + paket.schaetzung;
                    }
                }
                paketFromPakete.schaetzung = schaetzung;
            }
            /*if (paketFromPakete.children.length > 0) {
                paketFromPakete.schaetzung = paketFromPakete.children.filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0);
            }*/
        });
    }

    private fileToBucketArray(bucketsFromFile: any[]): void {
        for (const bucketFromFile of bucketsFromFile) {
            const newBucket = new Bucket(bucketFromFile.name);
            this._buckets.push(newBucket);
        }
        const useBucketStore = useBucketsStore();
        useBucketStore.bucketsAsSortedArray = this._buckets;
    }

    private fileToEintrageArray(eintrageFromFile: any[]): void {
        this._eintraege.unshift(new Zwischensumme("STARTSUMME", 0, 0, 0, 0));
        let aktuelleZwischensumme = this._eintraege[0] as Zwischensumme;
        for (const eintrag of eintrageFromFile) {
            if (eintrag.bezeichnung == "ZWISCHENSUMME") {
                const newZwischsumme = new Zwischensumme(eintrag.bezeichnung, 0, 0, 0, 0)
                aktuelleZwischensumme = newZwischsumme;
                this._eintraege.push(newZwischsumme)
            } else if (eintrag.aufwandRelativ != undefined) this._eintraege.push(new Eintrag(eintrag.bezeichnung, 0, 0, eintrag.aufwandRelativ, 0, true, aktuelleZwischensumme));
            else if (eintrag.aufwandAbsolut != undefined) this._eintraege.push(new Eintrag(eintrag.bezeichnung, 0, 0, 0, eintrag.aufwandAbsolut, false, aktuelleZwischensumme));
        }
        this._eintraege.push(new Zwischensumme("ENDSUMME", 0, 0, 0, 0))

    }

    private fileToProjectData(projectData: any): void {
        this._projekt = new Projekt(projectData.projektname, projectData.projektbeschreibung, projectData.bucketmodus, projectData.nachkommastellen);
    }

    private writeProjectStore() {
        const projectStore = useProjektStore();
        projectStore.projektbeschreibung = this._projekt.projektbeschreibung;
        projectStore.projektname = this._projekt.projektname;
        projectStore.bucketmodus = this._projekt.bucketmodus;
        projectStore.nachkommastellen = this._projekt.nachkommastellen;
    }

    private writeEintraegeStore() {
        const eintraegeStore = useEintraegeStore();
        eintraegeStore.eintraege = this._eintraege;
    }

    private writeBucketStoreBucketMap() {
        const bucketStore = useBucketsStore();
        const bucketsAsMap = new Map<number, Bucket>();
        for (const bucket of this._buckets) {
            bucketsAsMap.set(bucket.id, bucket);
        }
        bucketStore.bucketsAsMap = bucketsAsMap;
    }

    private writeBucketStoreBucketArray() {
        const bucketStore = useBucketsStore();
        bucketStore.bucketsAsSortedArray = this._buckets
    }

    private writePaketeStorePaketeMap() {
        const paketeStore = usePaketeStore();
        const paketeMap = new Map<number, Paket>();
        for (const paket of this._pakete) {
            paketeMap.set(paket.id, paket)
        }
        paketeStore.paketeAsMap = paketeMap;
    }

    private writePaketeStorePaketeTreeView() {
        const paketeStore = usePaketeStore();
        const paketeAsTreeView: Paket[] = [];
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
                paketeAsTreeView.push(aktuellesPaket);
            }
        }
        paketeStore.paketeAsTreeView = paketeAsTreeView;
    }

    private writePaketeStoreUnsortedPaketeListsSortedByBucketsMap() {
        const paketeStore = usePaketeStore();
        const unsortedPaketeListsSortedByBucketsMap = new Map<Bucket, Paket[]>()
        for (const bucket of this._buckets) {
            unsortedPaketeListsSortedByBucketsMap.set(bucket as Bucket, []);
        }
        this._pakete.forEach(paket => {
            if (paket.bucket)
                unsortedPaketeListsSortedByBucketsMap.get(paket.bucket)!.push(paket);
        });
        paketeStore.unsortedPaketeListsSortedByBucketsMap = unsortedPaketeListsSortedByBucketsMap;
    }
}