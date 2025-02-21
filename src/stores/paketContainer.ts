import { defineStore } from "pinia";
import { Paket } from "@/models/Paket";
import { ref } from "vue";
import type { Bucket } from "@/models/Bucket";
import { useKonfigContainer } from "@/stores/konfigContainer";

export const usePaketContainer = defineStore("pakete", () => {
  const paketeAsTreeView = ref<Array<Paket>>([]);
  const paketeAsMap = ref(new Map<number, Paket>());
  const unsortedPaketeListsSortedByBucketsMap = ref(new Map<Bucket, Paket[]>());

  function paketeFullTreeView() {
    const result: Paket[] = [];
    const stack: Paket[] = [...paketeAsTreeView.value as Paket[]];
    while (stack.length > 0) {
      const aktuellesPaket = stack.shift()!;
      result.push(aktuellesPaket);
      if (!aktuellesPaket.open) {
        stack.unshift(...aktuellesPaket.children.reverse());
      }
    }
    return result;
  }

  function paketeChildren() {
    return Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0) as Paket[];
  }

  function paketeChildrenWithNoBucket() {
    return Array.from(paketeAsMap.value.values()).filter(paket => paket.children.length == 0 && !paket.bucket) as Paket[];
  }

  function applyFilterOnPaket(paket: Paket, filterString: string): boolean {
    const paketStringIndexed: { [index: string]: any } = paket;
    for (const key in paketStringIndexed) {
      if (typeof paketStringIndexed[key] === "string" && paketStringIndexed[key].toLowerCase().includes(filterString.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  function paketeOfBucket(bucket: Bucket) {
    const result: Paket[] = [];
    for (const paket of paketeAsMap.value.values()) {
      if (paket instanceof Paket && paket.bucket == bucket) result.push(paket);
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

  function parentsOfPaket(paket: Paket): Array<Paket> {
    const result: Paket[] = [];
    let parentOfPaket = paket.parent;
    while (parentOfPaket) {
      result.push(parentOfPaket);
      parentOfPaket = parentOfPaket.parent;
    }
    return result;
  }
  function berechneSchaetzungen() {
    const paketeSortiertNachLevel: Paket[] = [];
    for(const paket of paketeAsMap.value.values()) {
      if(paket instanceof Paket) paketeSortiertNachLevel.push(paket)
    }
    paketeSortiertNachLevel.sort((a,b) => a.lvl + b.lvl )
    for(const paket of paketeSortiertNachLevel) {
      if(paket.parent!=null) {
          paket.parent.schaetzung = paket.parent.children.map(paket => paket.schaetzung).reduce((a, b) => (a ?? 0) + (b ?? 0));
      }
    }
  }
  function updateBucket(paket: Paket, bucket: Bucket | null) {
    if (paket.bucket!=null && paket.bucket!=bucket) {
      const indexOfPaket = unsortedPaketeListsSortedByBucketsMap.value.get(paket.bucket)!.indexOf(paket);
      unsortedPaketeListsSortedByBucketsMap.value.get(paket.bucket)!.splice(indexOfPaket, 1);
    }
    if (bucket!=null) {
      unsortedPaketeListsSortedByBucketsMap.value.get(bucket)!.push(paket);
    }
    const paketFromMap = paketeAsMap.value.get(paket.id);
    if(paketFromMap!=null) paket.bucket = bucket;
  }

  function updateTreeViewAfterChangedOpenState(changedPaket: Paket): number {
    const indexOfChangedPaket = paketeAsTreeView.value.indexOf(changedPaket);
    let counter = 0;
    const stack = [...changedPaket.children];
    if (changedPaket.open) {
      const paketeToAdd: Paket[] = [];
      while (stack.length > 0) {
        const aktuellesPaket = stack.shift()!;
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
  function showPaket(paket: Paket) {
    let parentOfPaket = paket.parent;
    const parents:Paket[]=[]
    while(parentOfPaket) {
      if(!parentOfPaket.open) parents.unshift(parentOfPaket);
      parentOfPaket = parentOfPaket.parent;
    }
    for(const paketOfParents of parents) {
      paketOfParents.open = true;
      updateTreeViewAfterChangedOpenState(paketOfParents);
    }
  }
  function deletePaket(id: number) {
    const paketToDelete = paketeAsMap.value.get(id) as Paket;
    const stack = [paketToDelete];
    let counter = 0;
    while (stack.length > 0 && stack[0]!=null) {
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
      berechneSchaetzungen()
      //updateParentsAfterSchaetzungUpdated(paketToDelete);
  }

  function createNewUniqueTicketNr(): string {
    let result:string = "Neues Ticket";
    let iterations:number = 1;
    for (let i = 0; i < paketeAsTreeView.value.length; i++) {
      if(paketeAsTreeView.value[i].ticket_nr.toUpperCase()===result.toUpperCase()) {
        result = "Neues Ticket ("+iterations+")"
        iterations++;
        i = 0;
      }
    }
    return result;
  }

  function addNew(id: number): number {
    const newPaket = new Paket("" , "beispiel", "beispiel", null, null, false, 0, null, []);
    newPaket.ticket_nr = createNewUniqueTicketNr();
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
        updateBucket(newPaket, null);
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
    const newPaket = new Paket("", "beispiel", "beispiel",  null, null, false, 0,   null, []);
    newPaket.ticket_nr = createNewUniqueTicketNr()
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
    berechneSchaetzungen();
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
      else if (newParent.schaetzung != null && paketToMove.schaetzung != null) {
        paketToMove.schaetzung = newParent.schaetzung;
        berechneSchaetzungen();
      } else {
        newParent.schaetzung = paketToMove.schaetzung;
      }
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
      } else if (parentOfPaketToMove.schaetzung != null && paketToMove.schaetzung != null) {
        parentOfPaketToMove.schaetzung -= paketToMove.schaetzung;
        parentOfPaketToMove.schaetzung = parseFloat(parentOfPaketToMove.schaetzung.toFixed(useKonfigContainer().nachkommastellen));
      }
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
      } else if (parentOfPaketToMove.schaetzung != null && paketToMove.schaetzung != null) {
        parentOfPaketToMove.schaetzung -= paketToMove.schaetzung;
        parentOfPaketToMove.schaetzung = parseFloat(parentOfPaketToMove.schaetzung.toFixed(useKonfigContainer().nachkommastellen));
      }
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
    if (paketToMove.lvl == 0) paketToMove.parent = null;
    else paketToMove.parent = parentOfPaketToMove.parent;
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

  }

  return {
    paketeAsMap,
    paketeAsTreeView,
    unsortedPaketeListsSortedByBucketsMap,
    paketeFullTreeView,
    paketeChildren,
    paketeChildrenWithNoBucket,
    applyFilterOnPaket,
    showPaket,
    paketeOfBucket,
    parentsOfPaket,
    rootParentOfPaket,
    updateTreeViewAfterChangedOpenState,
    berechneSchaetzungen,
    updateBucket,
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