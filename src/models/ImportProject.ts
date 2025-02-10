import {Bucket} from "@/models/Bucket";
import {Paket} from "@/models/Paket";
import type {AbstrakterEintrag} from "@/models/AbstrakterEintrag";
import {Zwischensumme} from "@/models/Zwischensumme";
import {Aufschlag} from "@/models/Aufschlag";
import {Projekt} from "@/models/Projekt";
import {useBucketContainer} from "@/stores/bucketContainer";
import {useKonfigContainer} from "@/stores/konfigContainer";
import {useEintragContainer} from "@/stores/eintragContainer";
import {usePaketContainer} from "@/stores/paketContainer";
import {useVergleicheStore} from "@/stores/vergleiche";

export class ImportProject {
    private readonly _buckets: Bucket[] = []
    private readonly _pakete: Paket[] = []
    private readonly _eintraege: AbstrakterEintrag[] = []
    private _projektKonfig: Projekt = new Projekt("",  true,2)
    private _checkboxIds: number[] = []

    constructor(fileContents: string) {
        const jsonfile = JSON.parse(fileContents);
        this.fileToProjektKonfig(jsonfile.projektKonfig)
        this.fileToBucketArray(jsonfile.buckets);
        this.fileToPaketeArray(jsonfile.pakete, jsonfile.paketeTree);
        this.fileToEintrageArray(jsonfile.eintraege);
        this.fileToCheckboxIdsArray(jsonfile.checkboxIds)
        this.writeKonfigContainer();
        this.writeEintragContainer();
        this.writeBucketContainerBucketArray();
        this.writeBucketContainerBucketMap();
        this.writePaketContainerPaketeMap();
        this.writePaketContainerPaketeTreeView();
        this.writePaketContainerUnsortedPaketeListsSortedByBucketsMap();
        this.writeCheckboxIds();
    }

    private fileToPaketeArray(paketefromFile: any[], paketeTree: any[]): void {
        let highestId = 0
        for (const paketFromFile of paketefromFile) {
            const newPaket = new Paket(paketFromFile.ticket_nr, paketFromFile.thema, paketFromFile.beschreibung, paketFromFile.bucket ? this._buckets.find(bucket => bucket.name == paketFromFile.bucket)! : null, paketFromFile.schaetzung, paketFromFile.open, 0, null, [], paketFromFile.id)
            this._pakete.push(newPaket);
            if(newPaket.id > highestId) highestId = newPaket.id
        }
        Paket.idCounter = highestId + 1;
        this.generatePakete(0);//Nur dev-Zweck
        this.setPaketeTreeStructure(paketeTree);
        this.setPaketeLevelAndSchaetzung();
    }

    private generatePakete(numberPakete: number) {
        for (let i = 0; i < numberPakete; i++) {
            const newPaket = new Paket("Ticket-Nr " + (i + numberPakete), "Testing " + (i + numberPakete), "Ticket zum Testen", null, null, false, 0, null, []);
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
            let newBucket ;
            if(bucketFromFile.id!==null) newBucket = new Bucket(bucketFromFile.name,bucketFromFile.id);
            else newBucket = new Bucket(bucketFromFile.name)
            this._buckets.push(newBucket);
        }
        const usebucketContainer = useBucketContainer();
        usebucketContainer.bucketsAsSortedArray = this._buckets;
    }

    private fileToEintrageArray(eintrageFromFile: any[]): void {
        this._eintraege.unshift(new Zwischensumme("Startsumme", 0, 0, 0, 0));
        for (const eintrag of eintrageFromFile) {
            if (eintrag.bezeichnung == "Zwischensumme") {
                const newZwischsumme = new Zwischensumme(eintrag.bezeichnung, 0, 0, 0, 0)
                this._eintraege.push(newZwischsumme)
            } else if (eintrag.aufwandRelativ != undefined) this._eintraege.push(new Aufschlag(eintrag.bezeichnung, 0, 0, eintrag.aufwandRelativ, 0, true, null,null));
            else if (eintrag.aufwandAbsolut != undefined) this._eintraege.push(new Aufschlag(eintrag.bezeichnung, 0, 0, 0, eintrag.aufwandAbsolut, false, null,null));
        }
        this._eintraege.push(new Zwischensumme("Endsumme", 0, 0, 0, 0))

    }

    private fileToProjektKonfig(projectData: any): void {
        this._projektKonfig = new Projekt(projectData.projektname, projectData.bucketmodus,projectData.nachkommastellen);
    }

    private fileToCheckboxIdsArray(checkboxIds: any): void {
        this._checkboxIds=checkboxIds
    }

    private writeKonfigContainer() {
        const konfigContainer = useKonfigContainer();
        konfigContainer.projektname = this._projektKonfig.projektname;
        konfigContainer.bucketmodus = this._projektKonfig.bucketmodus;
        konfigContainer.nachkommastellen = this._projektKonfig.nachkommastellen;
    }

    private writeEintragContainer() {
        const eintragContainer = useEintragContainer();
        eintragContainer.eintraege = this._eintraege;
    }

    private writeBucketContainerBucketMap() {
        const bucketContainer = useBucketContainer();
        const bucketsAsMap = new Map<number, Bucket>();
        for (const bucket of this._buckets) {
            bucketsAsMap.set(bucket.id, bucket);
        }
        bucketContainer.bucketsAsMap = bucketsAsMap;
    }

    private writeBucketContainerBucketArray() {
        const bucketContainer = useBucketContainer();
        bucketContainer.bucketsAsSortedArray = this._buckets
    }

    private writePaketContainerPaketeMap() {
        const paketContainer = usePaketContainer();
        const paketeMap = new Map<number, Paket>();
        for (const paket of this._pakete) {
            paketeMap.set(paket.id, paket)
        }
        paketContainer.paketeAsMap = paketeMap;
    }

    private writePaketContainerPaketeTreeView() {
        const paketContainer = usePaketContainer();
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
        paketContainer.paketeAsTreeView = paketeAsTreeView;
    }

    private writePaketContainerUnsortedPaketeListsSortedByBucketsMap() {
        const paketContainer = usePaketContainer();
        const unsortedPaketeListsSortedByBucketsMap = new Map<Bucket, Paket[]>()
        for (const bucket of this._buckets) {
            unsortedPaketeListsSortedByBucketsMap.set(bucket as Bucket, []);
        }
        this._pakete.forEach(paket => {
            if (paket.bucket)
                unsortedPaketeListsSortedByBucketsMap.get(paket.bucket)!.push(paket);
        });
        paketContainer.unsortedPaketeListsSortedByBucketsMap = unsortedPaketeListsSortedByBucketsMap;
    }
    private writeCheckboxIds():void {
        const vergleichStore = useVergleicheStore();
        vergleichStore.checkboxSelectedIds.length=0;

        for(const id of this._checkboxIds) {
            vergleichStore.checkboxSelectedIds.push(id)
        }
    }
}