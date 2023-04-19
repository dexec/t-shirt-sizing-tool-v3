import {defineStore} from "pinia";
import {Paket} from "@/Paket";
import {ref} from "vue";
import saveFile from "@/stores/file.json";
import type {Bucket} from "@/Bucket";
import {useBucketsStore} from "@/stores/buckets";

export const usePaketeStore = defineStore('pakete', () => {
    const buckets = useBucketsStore()
    const stackForTreeView = ref<Array<Paket>>([]);
    const paketeAsTreeView = ref<Array<Paket>>([]);
    const paketeAsMap = ref(new Map<number, Paket>());

    let highestID = 0;
    for (const paket of saveFile.pakete) {
        if (paket.id > highestID) highestID = paket.id
        paketeAsMap.value.set(paket.id, new Paket(paket.ticket_nr, paket.thema, paket.beschreibung, paket.komponente, buckets.buckets.find(bucket => bucket.name == paket.bucket) as Bucket, paket.schaetzung, paket.open, 0, null, [], paket.id))
    }
    Paket.idCounter = highestID + 1;
    for (let i = 0; i < 10; i++) {
        const newPaket = new Paket("1111", "Testing", "Ticket zum Testen", "Test", null, 0, false, 0, null, []);
        paketeAsMap.value.set(newPaket.id, newPaket);
    }
    paketeAsMap.value.forEach((value: Paket, key: number) => {
        for (const paket of saveFile.paketeTree) {
            if (paket.key == key) {
                for (const paketChildID of paket.children) {
                    const paketChild = paketeAsMap.value.get(paketChildID) as Paket
                    paketChild.parent = value
                    value.children.push(paketChild)
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
        if (lvl == 0) stackForTreeView.value.push(value)
    })

    while (stackForTreeView.value.length > 0) {
        const aktuellesPaket = stackForTreeView.value.shift();
        if (aktuellesPaket != undefined) {
            if (aktuellesPaket.children.length > 0) {
                for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                    if (aktuellesPaket.open)
                        stackForTreeView.value.unshift(aktuellesPaket.children[i]);
                }
            }
            paketeAsTreeView.value.push(aktuellesPaket);
        }
    }
    const paketeAsFlatView = ref<Array<Paket>>(Array.from(paketeAsMap.value.values()))
    //TODO DATENSTRUKTUREN BEIM ANLEGEN UND LÖSCHEN VON PAKETEN EBENFALLS UPDATEN
    const paketeChildren = ref<Array<Paket>>(Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0))
    const paketeChildrenWithNoBucket = ref<Array<Paket>>(Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0 && !paket.bucket))

    function updatePaket(newPaket: Paket): Paket {
        let oldPaket = paketeAsMap.value.get(newPaket.id) as Paket;
        oldPaket = newPaket;
        return oldPaket;
    }

    function updateTreeViewAfterChangedOpenState(changedPaket: Paket): number {
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
                paketeToAdd.push(aktuellesPaket)
            }
            paketeAsTreeView.value.splice(indexOfChangedPaket + 1, 0, ...paketeToAdd)
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
            paketeAsMap.value.delete(aktuellesPaket.id);
            if (aktuellesPaket.open) {
                for (const child of aktuellesPaket.children) {
                    stack.push(child);
                }
            }
            counter++;
        }
        paketeAsTreeView.value.splice(paketeAsTreeView.value.indexOf(paketToDelete), counter);
        const parentOfPaket = paketToDelete.parent;
        if (parentOfPaket) {
            parentOfPaket.children.splice(parentOfPaket.children.indexOf(paketToDelete), 1);
        }
        paketToDelete.children = [];
        paketeAsMap.value.delete(id);
    }

    function addNew(id: number): number {
        const parentOfNewPaket = paketeAsMap.value.get(id) as Paket;
        const newPaket = new Paket('beispiel', 'beispiel', 'beispiel', 'beispiel', null, 1234, false, 0, null, []);
        if (!parentOfNewPaket) {
            paketeAsTreeView.value.unshift(newPaket);
        } else {
            newPaket.lvl = parentOfNewPaket.lvl + 1;
            newPaket.parent = parentOfNewPaket;
            if (!parentOfNewPaket.open) {
                parentOfNewPaket.open = true;
                updateTreeViewAfterChangedOpenState(parentOfNewPaket);
            }
            parentOfNewPaket.children.unshift(newPaket);
            paketeAsTreeView.value.splice(paketeAsTreeView.value.indexOf(parentOfNewPaket) + 1, 0, newPaket);
        }
        paketeAsMap.value.set(newPaket.id, newPaket);
        parentOfNewPaket.bucket = null;
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
        indexOfPaketToMove -=hiddenPaketeCount;
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

    function moveDownRight(id: number) {
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
        newParent.children.unshift(paketToMove);
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

    function moveUpRight(id: number) {
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
        newParent.children.unshift(paketToMove);
        //Pakets Elternteil wird neu zugewiesen
        paketToMove.parent = newParent;
        // Alle Level von Paket werden erhöht
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
        if (paketToMove.lvl == 0 || !paketToMove.parent) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        let indexOfParent = -1;
        for (let i = indexOfPaketToMove - 1; indexOfParent == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl-1) {
                indexOfParent = i;
            }
        }
        if (paketToMove.lvl >= 1) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1);
            if (paketToMove.lvl >= 2 && paketToMove.parent.parent) {
                const indexOfParentAsChild = paketToMove.parent.parent.children.indexOf(paketToMove.parent);
                paketToMove.parent.parent.children.splice(indexOfParentAsChild, 0, paketToMove);
            }
        }
        if (paketToMove.parent.children.length == 0) paketToMove.parent.open = false;
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
        else paketToMove.parent = paketToMove.parent.parent;
    }

    function moveLeftDown(id: number) {
        const paketToMove = paketeAsMap.value.get(id) as Paket;
        if (paketToMove.lvl == 0 || !paketToMove.parent) return;
        const indexOfPaketToMove = paketeAsTreeView.value.indexOf(paketToMove);
        let indexOfParent = -1;
        for (let i = indexOfPaketToMove - 1; indexOfParent == -1; i--) {
            if (paketeAsTreeView.value[i].lvl == paketToMove.lvl-1) {
                indexOfParent = i;
            }
        }
        if (paketToMove.lvl >= 1) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1);
            if (paketToMove.lvl >= 2 && paketToMove.parent.parent) {
                const indexOfParentAsChild = paketToMove.parent.parent.children.indexOf(paketToMove.parent);
                paketToMove.parent.parent.children.splice(indexOfParentAsChild + 1, 0, paketToMove);
            }
        }
        if (paketToMove.parent.children.length == 0) paketToMove.parent.open = false;
        updateLvl(-1, paketToMove);
        const paketToMoveOpenAfter = paketToMove.open;
        if (paketToMove.open) {
            paketToMove.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        paketeAsTreeView.value.splice(indexOfPaketToMove, 1);
        const parentOpenAfter = paketToMove.parent.open;
        if (paketToMove.parent.open) {
            paketToMove.parent.open = false;
            updateTreeViewAfterChangedOpenState(paketToMove.parent);
        }
        paketeAsTreeView.value.splice(indexOfParent + 1, 0, paketToMove);
        if (paketToMoveOpenAfter) {
            paketToMove.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove);
        }
        if (parentOpenAfter) {
            paketToMove.parent.open = true;
            updateTreeViewAfterChangedOpenState(paketToMove.parent);
        }
        if (paketToMove.lvl == 0) paketToMove.parent = null;
        else paketToMove.parent = paketToMove.parent.parent;
    }

    return {
        paketeAsMap,
        paketeAsTreeView,
        paketeAsFlatView,
        paketeChildren,
        paketeChildrenWithNoBucket,
        updateTreeViewAfterChangedOpenState,
        updatePaket,
        deletePaket,
        addNew,
        moveUp,
        moveDown,
        moveDownRight,
        moveUpRight,
        moveLeftUp,
        moveLeftDown
    }
})