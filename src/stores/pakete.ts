import {defineStore} from "pinia";
import {Paket} from "@/Paket";
import {ref} from "vue";
import saveFile from "@/stores/file.json";
import type {Bucket} from "@/Bucket";
import {useBucketsStore} from "@/stores/buckets";

export const usePaketeStore = defineStore("pakete", () => {
    const bucketStore = useBucketsStore();
    const bucketsAsSortedArray = bucketStore.bucketsAsSortedArray;
    const stackForTreeView: Paket[] = [];
    const paketeAsTreeView = ref<Array<Paket>>([]);
    const paketeAsMap = ref(new Map<number, Paket>());
    const unsortedPaketeListsSortedByBucketsMap = ref(new Map<Bucket, Paket[]>());

    let highestID = 0;
    for (const paket of saveFile.pakete) {
        if (paket.id > highestID) highestID = paket.id;
        paketeAsMap.value.set(paket.id, new Paket(paket.ticket_nr, paket.thema, paket.beschreibung, paket.komponente, bucketsAsSortedArray.find(bucket => bucket.name == paket.bucket) as Bucket, paket.schaetzung, paket.open, 0, null, [], paket.id));
    }
    Paket.idCounter = highestID + 1;
    //Stresstest generierung
    const anzahlStresstests = 1000;
    for (let i = 0; i < anzahlStresstests; i++) {
        const newPaket = new Paket(i + anzahlStresstests + "", "Testing" + i, "Ticket zum Testen", "Test", null, null, false, 0, null, []);
        paketeAsMap.value.set(newPaket.id, newPaket);
    }
    paketeAsMap.value.forEach((value: Paket, key: number) => {
        for (const paket of saveFile.paketeTree) {
            if (paket.key == key) {
                for (const paketChildId of paket.children) {
                    const paketChild = paketeAsMap.value.get(paketChildId) as Paket;
                    paketChild.parent = value;
                    value.children.push(paketChild);
                }
            }
        }
    });
    paketeAsMap.value.forEach((value: Paket) => {
        let lvl = 0;
        let parent = value.parent;
        while (parent) {
            lvl++;
            parent = parent.parent;
        }
        value.lvl = lvl;
        if (lvl == 0) stackForTreeView.push(value);
        if (value.children.length > 0) value.schaetzung = value.children.filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0);
    });

    while (stackForTreeView.length > 0) {
        const aktuellesPaket = stackForTreeView.shift();
        if (aktuellesPaket != undefined) {
            if (aktuellesPaket.children.length > 0) {
                for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                    if (aktuellesPaket.open)
                        stackForTreeView.unshift(aktuellesPaket.children[i]);
                }
            }
            paketeAsTreeView.value.push(aktuellesPaket);
        }
    }

    for (const bucket of bucketsAsSortedArray) {
        unsortedPaketeListsSortedByBucketsMap.value.set(bucket as Bucket, []);
    }

    paketeAsMap.value.forEach(paket => {
        if (paket.bucket)
            unsortedPaketeListsSortedByBucketsMap.value.get(paket.bucket)!.push(paket);
    });

    function paketeAsFlatView() {
        return Array.from(paketeAsMap.value.values());
    }

    function paketeChildren() {
        return Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0);
    }

    function paketeChildrenWithNoBucket() {
        return Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0 && !paket.bucket);
    }

    function paketeOfBucket(bucket: Bucket) {
        const result: Paket[] = [];
        for (const paket of paketeAsMap.value.values()) {
            if (paket.bucket == bucket) result.push(paket);
        }
        return result;
    }

    function rootParentOfPaket(paket: Paket): Paket | null {
        if (paket.lvl == 0) return null;
        let result = paket.parent;
        while (result?.parent) {
            result = result.parent;
        }
        return result;
    }

    function parentsOfPaket(paket:Paket): Array<Paket> {
        const result: Paket[]=[];
        let parentOfPaket = paket.parent;
        while(parentOfPaket) {
            result.push(parentOfPaket);
            parentOfPaket=parentOfPaket.parent;
        }
        return result;
    }

    function updateSchaetzung(paket: Paket, diff: number) {
        let parentOfPaket = paket.parent;
        while (parentOfPaket) {
            if (parentOfPaket.children.length === 0) parentOfPaket.schaetzung = null;
            else parentOfPaket.schaetzung = (parentOfPaket.schaetzung ?? 0) + diff;
            parentOfPaket = parentOfPaket.parent;
        }
    }

    function updateBucket(paket: Paket, bucket: Bucket | null) {
        if (paket.bucket) {
            const indexOfPaket = unsortedPaketeListsSortedByBucketsMap.value.get(paket.bucket)!.indexOf(paket);
            unsortedPaketeListsSortedByBucketsMap.value.get(paket.bucket)!.splice(indexOfPaket, 1);
        }
        if (bucket) {
            unsortedPaketeListsSortedByBucketsMap.value.get(bucket)!.push(paket);
        }
        //Um computed Properties zu triggern, die die Map nutzen
        paketeAsMap.value.get(paket.id)!.bucket = bucket;
    }

    function updateTreeViewAfterChangedOpenState(changedPaket: Paket): number {
        const parent = changedPaket.parent;
        if (parent && !parent.open) {
            return updateTreeViewAfterChangedOpenState(parent);
        } else {
            const indexOfChangedPaket = paketeAsTreeView.value.indexOf(changedPaket);
            let counter = 0;
            const stack = [...changedPaket.children];
            if (changedPaket.open) {
                const paketeToAdd: Paket[] = [];
                while (stack.length > 0) {
                    const aktuellesPaket = stack.shift() as Paket;
                    if (aktuellesPaket.open) {
                        stack.unshift(...aktuellesPaket.children.reverse());
                    }
                    paketeToAdd.push(aktuellesPaket);
                }
                paketeAsTreeView.value.splice(indexOfChangedPaket + 1, 0, ...paketeToAdd);
                counter += paketeToAdd.length;
            } else {
                while (stack.length > 0) {
                    const aktuellesPaket = stack.shift() as Paket;
                    if (aktuellesPaket.open) {
                        stack.unshift(...aktuellesPaket.children);
                    }
                    counter++;
                }
                paketeAsTreeView.value.splice(indexOfChangedPaket + 1, counter);
            }
            return counter;
        }
    }

    function updateLvl(addLvl: number, paket: Paket) {
        const stack = [paket];
        while (stack.length > 0) {
            const aktuellesPaket = stack.pop() as Paket;
            aktuellesPaket.lvl += addLvl;
            for (const child of aktuellesPaket.children) {
                stack.push(child);
            }

        }
    }

    function deletePaket(id: number) {
        const paketToDelete = paketeAsMap.value.get(id) as Paket;
        const stack = [paketToDelete];
        let counter = 0;
        while (stack.length > 0) {
            const aktuellesPaket = stack.shift() as Paket;
            if (aktuellesPaket.open) {
                for (const child of aktuellesPaket.children) {
                    stack.push(child);
                }
            }
            counter++;
        }
        paketeAsTreeView.value.splice(paketeAsTreeView.value.indexOf(paketToDelete), counter);
        stack.push(paketToDelete);
        while (stack.length > 0) {
            const aktuellesPaket = stack.shift() as Paket;
            for (const child of aktuellesPaket.children) {
                stack.push(child);
            }
            paketeAsMap.value.delete(aktuellesPaket.id);
            if (aktuellesPaket.bucket) {
                const indexOfAktuellesPaket = unsortedPaketeListsSortedByBucketsMap.value.get(aktuellesPaket.bucket)?.indexOf(aktuellesPaket)!;
                unsortedPaketeListsSortedByBucketsMap.value.get(aktuellesPaket.bucket)?.splice(indexOfAktuellesPaket, 1);
            }
        }
        const parentOfPaket = paketToDelete.parent;
        if (parentOfPaket) {
            parentOfPaket.children.splice(parentOfPaket.children.indexOf(paketToDelete), 1);
        }
        if (paketToDelete.schaetzung != null)
            updateSchaetzung(paketToDelete, -1 * paketToDelete.schaetzung);
    }

    function addNew(id: number): number {
        const newPaket = new Paket("beispiel", "beispiel", "beispiel", "beispiel", null, null, false, 0, null, []);
        paketeAsMap.value.set(newPaket.id, newPaket);
        if (id == -1) {
            paketeAsTreeView.value.unshift(newPaket);
        } else {
            const paketBefore = paketeAsMap.value.get(id) as Paket;
            const indexOfPaketBefore = paketeAsTreeView.value.indexOf(paketBefore);
            const paketBeforeOpenAfter = paketBefore.open;
            if (paketBefore.open) {
                paketBefore.open = false;
                updateTreeViewAfterChangedOpenState(paketBefore);
            }
            if (paketBefore.parent) {
                const indexOfPaketBeforeAsChild = paketBefore.parent.children.indexOf(paketBefore);
                paketBefore.parent.children.splice(indexOfPaketBeforeAsChild + 1, 0, newPaket);
                newPaket.parent = paketBefore.parent;
                updateBucket(newPaket,null)
            }
            newPaket.lvl = paketBefore.lvl;
            paketeAsTreeView.value.splice(indexOfPaketBefore + 1, 0, newPaket);
            if (paketBeforeOpenAfter) {
                paketBefore.open = true;
                updateTreeViewAfterChangedOpenState(paketBefore);
            }
        }

        return newPaket.id;
    }

    function addNewChild(id: number): number {
        const parentOfNewPaket = paketeAsMap.value.get(id) as Paket;
        const newPaket = new Paket("beispiel", "beispiel", "beispiel", "beispiel", null, null, false, 0, null, []);
        newPaket.lvl = parentOfNewPaket.lvl + 1;
        newPaket.parent = parentOfNewPaket;
        if (parentOfNewPaket.children.length == 0) {
            newPaket.schaetzung = parentOfNewPaket.schaetzung;
        }
        if (!parentOfNewPaket.open) {
            parentOfNewPaket.open = true;
            updateTreeViewAfterChangedOpenState(parentOfNewPaket);
        }
        parentOfNewPaket.children.unshift(newPaket);
        paketeAsTreeView.value.splice(paketeAsTreeView.value.indexOf(parentOfNewPaket) + 1, 0, newPaket);
        paketeAsMap.value.set(newPaket.id, newPaket);
        updateBucket(parentOfNewPaket, null);
        return newPaket.id;
    }

    function moveUp(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        if (paketToMove.parent && paketToMove.parent.children.indexOf(paketToMove) == 0) return;
        let indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        if (indexOfPaketToMove == 0) return;
        let indexOfPaketAbove = -1;
        for (let i = indexOfPaketToMove - 1; indexOfPaketAbove == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl) {
                indexOfPaketAbove = i;
            }
        }
        const paketAbove = paketeAsTreeView.value[indexOfPaketAbove] as Paket;
        const paketToMoveOpenAfter = paketToMove.open;
        const paketAboveOpenAfter = paketAbove.open;
        let hiddenPaketeCount = 0;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (paketAbove.open) {
            paketAbove.open = false;
            hiddenPaketeCount = updateTreeViewAfterChangedOpenState(paketAbove);
        }
        if (paketToMove.parent) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children[indexOfPaketToMoveAsChild] = paketToMove.parent.children[indexOfPaketToMoveAsChild - 1];
            paketToMove.parent.children[indexOfPaketToMoveAsChild - 1] = paketToMove;
        }
        indexOfPaketToMove -= hiddenPaketeCount;
        paketeAsTreeView.value[indexOfPaketToMove] = paketAbove;
        paketeAsTreeView.value[indexOfPaketToMove - 1] = paketToMove;
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (paketAboveOpenAfter) {
            paketAbove.open = true;
            updateTreeViewAfterChangedOpenState(paketAbove);
        }
    }

    function moveDown(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        if (paketToMove.parent && paketToMove.parent.children.indexOf(paketToMove) == paketToMove.parent.children.length - 1) return;
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        if (paketToMove.lvl == 0 && indexOfPaketToMove == paketeAsTreeView.value.length - 1) {
            if (paketToMoveOpenAfter) {
                paketToMove.open = true;
                updateTreeViewAfterChangedOpenState(paketToMove);
            }
            return;
        }
        const indexOfPaketUnder = indexOfPaketToMove + 1;
        const paketUnder = paketeAsTreeView.value[indexOfPaketUnder] as Paket;
        const paketUnderOpenAfter = paketUnder.open;
        if (paketUnder.open) {
            paketUnder.open = false;
            updateTreeViewAfterChangedOpenState(paketUnder);
        }
        if (paketToMove.parent) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children[indexOfPaketToMoveAsChild] = paketToMove.parent.children[indexOfPaketToMoveAsChild + 1];
            paketToMove.parent.children[indexOfPaketToMoveAsChild + 1] = paketToMove;
        }
        paketeAsTreeView.value[indexOfPaketToMove] = paketUnder;
        paketeAsTreeView.value[indexOfPaketToMove + 1] = paketToMove;
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (paketUnderOpenAfter) {
            paketUnder.open = true;
            updateTreeViewAfterChangedOpenState(paketUnder);
        }
    }

    function moveRightDown(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        if (paketToMove.parent && paketToMove.parent.children.indexOf(paketToMove) == paketToMove.parent.children.length - 1) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        if (paketToMove.lvl == 0 && indexOfPaketToMove == paketeAsTreeView.value.length - 1) return;
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        const indexOfNewParent = indexOfPaketToMove + 1;
        const newParent = paketeAsTreeView.value[indexOfNewParent] as Paket;
        if (paketToMove.lvl > 0 && paketToMove.parent) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1);
        }
        if (newParent.children.length == 0) {
            if (newParent.schaetzung != null && paketToMove.schaetzung == null) paketToMove.schaetzung = newParent.schaetzung;
            else newParent.schaetzung = paketToMove.schaetzung;
        } else newParent.schaetzung = (newParent.schaetzung ?? 0) + (paketToMove.schaetzung ?? 0);
        newParent.children.unshift(paketToMove);
        updateBucket(newParent, null);
        paketToMove.parent = newParent;
        updateLvl(1, paketToMove);
        paketeAsTreeView.value.splice(indexOfPaketToMove, 1);
        if (!newParent.open) {
            newParent.open = true;
            updateTreeViewAfterChangedOpenState(newParent);
        } else {
            paketeAsTreeView.value.splice(indexOfNewParent, 0, paketToMove);
        }
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
    }

    function moveRightUp(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        if (paketToMove.parent && paketToMove.parent.children.indexOf(paketToMove) == 0) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        if (indexOfPaketToMove == 0) return;
        // Paket wird geschlossen
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        // Wenn Paket ein Elternelement hat, wird es aus dem Elternteil gelöscht
        if (paketToMove.lvl > 0 && paketToMove.parent) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1);
        }
        // Index vom neuen Elternteil wird gesucht
        let indexOfNewParent = -1;
        for (let i = indexOfPaketToMove - 1; indexOfNewParent == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl) {
                indexOfNewParent = i;
            }
        }
        // Paket wird dem neuen Elternteil als Kind zugewiesen
        const newParent = paketeAsTreeView.value[indexOfNewParent] as Paket;
        //Schätzung vom neuen Parent anpassen
        if (newParent.children.length == 0) {
            if (newParent.schaetzung != null && paketToMove.schaetzung == null) paketToMove.schaetzung = newParent.schaetzung;
            else newParent.schaetzung = paketToMove.schaetzung;
        } else newParent.schaetzung = (newParent.schaetzung ?? 0) + (paketToMove.schaetzung ?? 0);
        //Bucket von newParent zurücksetzen
        updateBucket(newParent, null);
        //Pakets Elternteil wird neu zugewiesen
        paketToMove.parent = newParent;
        // Alle Level von Paket werden erhöht
        newParent.children.unshift(paketToMove);
        updateLvl(1, paketToMove);
        // Paket wird aus TreeView entfernt
        paketeAsTreeView.value.splice(indexOfPaketToMove, 1);
        // Neuer Elternteil wird geöffnet
        if (!newParent.open) {
            newParent.open = true;
            updateTreeViewAfterChangedOpenState(newParent);
        } else {
            // Wenn schon offen, dann wird neues Paket an die Spitze gesetzt
            paketeAsTreeView.value.splice(indexOfNewParent + 1, 0, paketToMove);
        }
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
    }

    function moveLeftUp(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        const parentOfPaketToMove = paketToMove.parent;
        if (paketToMove.lvl == 0 || !parentOfPaketToMove) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        let indexOfParent = -1;
        for (let i = indexOfPaketToMove - 1; indexOfParent == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl - 1) {
                indexOfParent = i;
            }
        }
        if (paketToMove.lvl >= 1) {
            const indexOfPaketToMoveAsChild = parentOfPaketToMove.children.indexOf(paketToMove);
            parentOfPaketToMove.children.splice(indexOfPaketToMoveAsChild, 1);
            if (parentOfPaketToMove.children.length == 0) {
                parentOfPaketToMove.schaetzung = null;
            } else if (parentOfPaketToMove.schaetzung != null && paketToMove.schaetzung != null) parentOfPaketToMove.schaetzung -= paketToMove.schaetzung;
            if (paketToMove.lvl >= 2 && parentOfPaketToMove.parent) {
                const indexOfParentAsChild = parentOfPaketToMove.parent.children.indexOf(parentOfPaketToMove);
                parentOfPaketToMove.parent.children.splice(indexOfParentAsChild, 0, paketToMove);
            }
        }
        if (parentOfPaketToMove.children.length == 0) parentOfPaketToMove.open = false;
        updateLvl(-1, paketToMove);
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        paketeAsTreeView.value.splice(indexOfPaketToMove, 1);
        paketeAsTreeView.value.splice(indexOfParent, 0, paketToMove);
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (paketToMove.lvl == 0) paketToMove.parent = null;
        else paketToMove.parent = parentOfPaketToMove.parent;
    }

    function moveLeftDown(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        const parentOfPaketToMove = paketToMove.parent;
        if (paketToMove.lvl == 0 || !parentOfPaketToMove) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        let indexOfParent = -1;
        for (let i = indexOfPaketToMove - 1; indexOfParent == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl - 1) {
                indexOfParent = i;
            }
        }
        if (paketToMove.lvl >= 1) {
            const indexOfPaketToMoveAsChild = parentOfPaketToMove.children.indexOf(paketToMove);
            parentOfPaketToMove.children.splice(indexOfPaketToMoveAsChild, 1);
            if (parentOfPaketToMove.children.length == 0) {
                parentOfPaketToMove.schaetzung = null;
            } else if (parentOfPaketToMove.schaetzung != null && paketToMove.schaetzung != null) parentOfPaketToMove.schaetzung -= paketToMove.schaetzung;
            if (paketToMove.lvl >= 2 && parentOfPaketToMove.parent) {
                const indexOfParentAsChild = parentOfPaketToMove.parent.children.indexOf(parentOfPaketToMove);
                parentOfPaketToMove.parent.children.splice(indexOfParentAsChild + 1, 0, paketToMove);
            }
        }
        if (parentOfPaketToMove.children.length == 0) parentOfPaketToMove.open = false;
        updateLvl(-1, paketToMove);
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        paketeAsTreeView.value.splice(indexOfPaketToMove, 1);
        const parentOpenAfter = parentOfPaketToMove.open;
        if (parentOfPaketToMove.open) {
            parentOfPaketToMove.open = false;
            updateTreeViewAfterChangedOpenState(parentOfPaketToMove);
        }
        paketeAsTreeView.value.splice(indexOfParent + 1, 0, paketToMove);
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (parentOpenAfter) {
            parentOfPaketToMove.open = true;
            updateTreeViewAfterChangedOpenState(parentOfPaketToMove);
        }
        if (paketToMove.lvl == 0) paketToMove.parent = null;
        else paketToMove.parent = parentOfPaketToMove.parent;
    }

    return {
        paketeAsMap,
        paketeAsTreeView,
        unsortedPaketeListsSortedByBucketsMap,
        paketeAsFlatView,
        paketeChildren,
        paketeChildrenWithNoBucket,
        paketeOfBucket,
        parentsOfPaket,
        rootParentOfPaket,
        updateSchaetzung,
        updateBucket,
        updateTreeViewAfterChangedOpenState,
        deletePaket,
        addNew,
        addNewChild,
        moveUp,
        moveDown,
        moveRightDown,
        moveRightUp,
        moveLeftUp,
        moveLeftDown
    };
});