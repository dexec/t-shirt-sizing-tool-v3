import { defineStore } from "pinia";
import saveFile from "./file.json";
import { Paket } from "@/Paket";

let loopCounter = 0;
const stackForMap: Paket[] = [];
const stackForTreeView: Paket[] = [];
const paketeAsTreeView: Paket[] = [];

let idCounter = 0;

const paketeAsMap = new Map();
for (const paketFile of saveFile.pakete) {
  loopCounter++;
  const paket = new Paket(paketFile.id, paketFile.ticket_nr, paketFile.thema, paketFile.beschreibung, paketFile.komponente, paketFile.bucket, paketFile.schaetzung, paketFile.open, paketFile.lvl, null, paketFile.children);
  stackForTreeView.push(paket);
  stackForMap.push(paket);
}

while (stackForMap.length > 0) {
  loopCounter++;
  const aktuellesPaket = stackForMap.shift();
  if (aktuellesPaket != undefined) {
    if (aktuellesPaket.children.length > 0) {
      for (const child of aktuellesPaket.children) {
        loopCounter++;
        child.parent = aktuellesPaket;
        stackForMap.push(child);
      }
    }

    aktuellesPaket.id = idCounter++;
    paketeAsMap.set(aktuellesPaket.id, aktuellesPaket);
  }
}

while (stackForTreeView.length > 0) {
  loopCounter++;
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

for (let i = idCounter; i < 10; i++, idCounter++) {
  const newPaket = new Paket(i, "111", "Testticket","Ticket zum Stresstesten","Test",null,null,false, 0,null,[])
  paketeAsTreeView.push(newPaket);
  paketeAsMap.set(i,newPaket);
}


export const usePaketeStore = defineStore("pakete", {
  state: () => ({
    paketeAsTreeView: paketeAsTreeView,
    paketeAsMap: paketeAsMap,
    idCounter: idCounter
  }),
  getters: {
    getTreeView(state) {
      return state.paketeAsTreeView;
    }
  },
  actions: {
    loadData() {

    },
    updatePaket(newPaket: Paket) {
      let oldPaket = this.paketeAsMap.get(newPaket.id);
      if (typeof oldPaket !== "undefined") oldPaket = newPaket;
    },
    updateTreeViewAfterChangedOpenState(changedPaket: Paket) {
      const indexOfChangedPaket = this.paketeAsTreeView.indexOf(changedPaket);
      let counter = 0;
      const stack = [...changedPaket.children];
      if (changedPaket.open) {
        while (stack.length > 0) {
          const aktuellesPaket = stack.shift();
          if (aktuellesPaket != undefined) {
            if (aktuellesPaket.open) {
              stack.unshift(...aktuellesPaket.children.reverse());
            }
            this.paketeAsTreeView.splice(indexOfChangedPaket + 1 + counter++, 0, aktuellesPaket);
          }
        }
      } else {
        while (stack.length > 0) {
          const aktuellesPaket = stack.shift();
          if (aktuellesPaket != undefined && aktuellesPaket.open) {
            stack.unshift(...aktuellesPaket.children);
          }
          counter++;
        }
        this.paketeAsTreeView.splice(indexOfChangedPaket + 1, counter);
      }
    },
    deletePaket(id: number) {
      const paketToDelete = this.paketeAsMap.get(id);
      const stack = [paketToDelete];
      let counter = 0;
      while (stack.length > 0) {
        const aktuellesPaket = stack.shift();
        if (aktuellesPaket.open) {
          for (const child of aktuellesPaket.children) {
            stack.push(child);
          }
        }
        counter++;
      }
      this.paketeAsTreeView.splice(this.paketeAsTreeView.indexOf(paketToDelete), counter);
      if (paketToDelete.parent !== null) paketToDelete.parent.children.splice(paketToDelete.parent.children.indexOf(paketToDelete), 1);
      paketToDelete.children = [];
      this.paketeAsMap.delete(id);
    },
    addNew(parent?: Paket) {
      const newPaket = new Paket(this.idCounter++, "beispiel", "beispiel", "beispiel", "beispiel", null, 1234, false, 0, null, []);
      if (parent == null) {
        this.paketeAsTreeView.push(newPaket);
      } else {
        newPaket.lvl = parent.lvl + 1;
        newPaket.parent = parent;
        if (!parent.open) {
          this.updateTreeViewAfterChangedOpenState(parent);
        }
        else parent.open = true;
        parent.children.unshift(newPaket);
        this.paketeAsTreeView.splice(this.paketeAsTreeView.indexOf(parent) + 1, 0, newPaket);
      }
      this.paketeAsMap.set(newPaket.id, newPaket)
    },
    moveUp(id: number) {
      const paketToMove = this.paketeAsMap.get(id);
      const indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove);
      const paketAbovePaketToMove = this.paketeAsTreeView[indexOfPaketToMove - 1];
      if(indexOfPaketToMove!=0) {
        if (paketAbovePaketToMove.lvl == paketToMove.lvl) {
          if (paketToMove.lvl != 0) {
            const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove);
            paketToMove.parent.children[indexOfPaketToMoveAsChild] = paketToMove.parent.children[indexOfPaketToMoveAsChild - 1];
            paketToMove.parent.children[indexOfPaketToMoveAsChild - 1] = paketToMove;
          }
          this.paketeAsTreeView[indexOfPaketToMove] = paketAbovePaketToMove;
          this.paketeAsTreeView[indexOfPaketToMove - 1] = paketToMove
        }
        else if(paketAbovePaketToMove.lvl>paketToMove.lvl) {
          if(paketToMove.lvl!=0) {
            paketToMove.parent.children.splice(paketToMove.parent.children.indexOf(paketToMove),1)
          }
          paketToMove.parent = paketAbovePaketToMove.parent;
          paketAbovePaketToMove.parent?.children.push(paketToMove);
          const diffLevel = paketAbovePaketToMove.lvl - paketToMove.lvl;
          paketToMove.lvl = paketAbovePaketToMove.lvl;
          /*const stack = [paketToMove];
          while(stack.length>0) {
            const aktuellesPaket = stack.pop();
            aktuellesPaket.lvl = aktuellesPaket.lvl + diffLevel;
            for(const child of aktuellesPaket.children) {
              stack.push(child);
            }
          }*/
        }
        else if(paketAbovePaketToMove.lvl < paketToMove.lvl) {
          return;
        }

      }
    },
    moveDown(id: number) {
      for(const paket of this.paketeAsTreeView) {
        paket.lvl+=5;
      }

    }
  }
});