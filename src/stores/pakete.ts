import { defineStore } from 'pinia'
import saveFile from './file.json'
import { Paket } from '@/Paket'

let loopCounter = 0
const stackForMap: Paket[] = []
const stackForTreeView: Paket[] = []
const paketeAsTreeView: Paket[] = []

let idCounter = 0

const paketeAsMap = new Map()
for (const paketFile of saveFile.pakete) {
  loopCounter++
  const paket = new Paket(paketFile.id, paketFile.ticket_nr, paketFile.thema, paketFile.beschreibung, paketFile.komponente, paketFile.bucket, paketFile.schaetzung, paketFile.open, paketFile.lvl, null, paketFile.children)
  stackForTreeView.push(paket)
  stackForMap.push(paket)
}

while (stackForMap.length > 0) {
  const aktuellesPaket = stackForMap.shift()
  if (aktuellesPaket != undefined) {
    if (aktuellesPaket.children.length > 0) {
      for (const child of aktuellesPaket.children) {
        child.parent = aktuellesPaket
        stackForMap.push(child)
      }
    }

    aktuellesPaket.id = idCounter++
    paketeAsMap.set(aktuellesPaket.id, aktuellesPaket)
  }
}

while (stackForTreeView.length > 0) {
  const aktuellesPaket = stackForTreeView.shift()
  if (aktuellesPaket != undefined) {
    if (aktuellesPaket.children.length > 0) {
      for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
        if (aktuellesPaket.open)
          stackForTreeView.unshift(aktuellesPaket.children[i])
      }
    }
    paketeAsTreeView.push(aktuellesPaket)
  }
}

for (let i = idCounter; i < 10000; i++, idCounter++) {
  const newPaket = new Paket(i, '111', 'Testticket', 'Ticket zum Stresstesten', 'Test', null, null, false, 0, null, [])
  paketeAsTreeView.push(newPaket)
  paketeAsMap.set(i, newPaket)
}


export const usePaketeStore = defineStore('pakete', {
  state: () => ({
    paketeAsTreeView: paketeAsTreeView,
    paketeAsMap: paketeAsMap,
    idCounter: idCounter
  }),
  getters: {
    getTreeView(state) {
      return state.paketeAsTreeView
    }
  },
  actions: {
    loadData() {

    },
    updatePaket(newPaket: Paket) {
      let oldPaket = this.paketeAsMap.get(newPaket.id)
      if (typeof oldPaket !== 'undefined') oldPaket = newPaket
    },
    updateTreeViewAfterChangedOpenState(changedPaket: Paket) {
      const indexOfChangedPaket = this.paketeAsTreeView.indexOf(changedPaket)
      let counter = 0
      const stack = [...changedPaket.children]
      if (changedPaket.open) {
        while (stack.length > 0) {
          const aktuellesPaket = stack.shift()
          if (aktuellesPaket != undefined) {
            if (aktuellesPaket.open) {
              stack.unshift(...aktuellesPaket.children.reverse())
            }
            this.paketeAsTreeView.splice(indexOfChangedPaket + 1 + counter++, 0, aktuellesPaket)
          }
        }
      } else {
        while (stack.length > 0) {
          const aktuellesPaket = stack.shift()
          if (aktuellesPaket != undefined && aktuellesPaket.open) {
            stack.unshift(...aktuellesPaket.children)
          }
          counter++
        }
        this.paketeAsTreeView.splice(indexOfChangedPaket + 1, counter)
      }
    },
    deletePaket(id: number) {
      const paketToDelete = this.paketeAsMap.get(id)
      const stack = [paketToDelete]
      let counter = 0
      while (stack.length > 0) {
        const aktuellesPaket = stack.shift()
        if (aktuellesPaket.open) {
          for (const child of aktuellesPaket.children) {
            stack.push(child)
          }
        }
        counter++
      }
      this.paketeAsTreeView.splice(this.paketeAsTreeView.indexOf(paketToDelete), counter)
      if (paketToDelete.parent !== null) paketToDelete.parent.children.splice(paketToDelete.parent.children.indexOf(paketToDelete), 1)
      paketToDelete.children = []
      this.paketeAsMap.delete(id)
    },
    addNew(id: number) {
      const parentOfNewPaket = this.paketeAsMap.get(id)
      const newPaket = new Paket(this.idCounter++, 'beispiel', 'beispiel', 'beispiel', 'beispiel', null, 1234, false, 0, null, [])
      if (parentOfNewPaket == null) {
        this.paketeAsTreeView.unshift(newPaket)
      } else {
        newPaket.lvl = parentOfNewPaket.lvl + 1
        newPaket.parent = parentOfNewPaket
        if (!parentOfNewPaket.open) {
          parentOfNewPaket.open = true
          this.updateTreeViewAfterChangedOpenState(parentOfNewPaket)
        }
        parentOfNewPaket.children.unshift(newPaket)
        this.paketeAsTreeView.splice(this.paketeAsTreeView.indexOf(parentOfNewPaket) + 1, 0, newPaket)
      }
      this.paketeAsMap.set(newPaket.id, newPaket)
    },
    moveUp(id: number) {
      const paketToMove = this.paketeAsMap.get(id)
      if (paketToMove.parent != null && paketToMove.parent.children.indexOf(paketToMove) == 0) return
      let indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      if (indexOfPaketToMove == 0) return
      let indexOfPaketAbove = -1
      for (let i = indexOfPaketToMove - 1; indexOfPaketAbove == -1; i--) {
        if (this.paketeAsTreeView[i].lvl == paketToMove.lvl) {
          indexOfPaketAbove = i
        }
      }
      const paketAbove = this.paketeAsTreeView[indexOfPaketAbove]
      const paketToMoveOpenAfter = paketToMove.open
      const paketAboveOpenAfter = paketAbove.open
      if (paketToMove.open) {
        paketToMove.open = false
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      if (paketAbove.open) {
        paketAbove.open = false
        this.updateTreeViewAfterChangedOpenState(paketAbove)
      }
      if (paketToMove.parent != null) {
        const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
        paketToMove.parent.children[indexOfPaketToMoveAsChild] = paketToMove.parent.children[indexOfPaketToMoveAsChild - 1]
        paketToMove.parent.children[indexOfPaketToMoveAsChild - 1] = paketToMove
      }
      indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      indexOfPaketAbove = this.paketeAsTreeView.indexOf(paketAbove)
      this.paketeAsTreeView[indexOfPaketToMove] = paketAbove
      this.paketeAsTreeView[indexOfPaketToMove - 1] = paketToMove
      if (paketToMoveOpenAfter) {
        paketToMove.open = true
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      if (paketAboveOpenAfter) {
        paketAbove.open = true
        this.updateTreeViewAfterChangedOpenState(paketAbove)
      }
    },
    moveDown(id: number) {
      const paketToMove = this.paketeAsMap.get(id)
      if (paketToMove.parent != null && paketToMove.parent.children.indexOf(paketToMove) == paketToMove.parent.children.length - 1) return
      let indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      if (paketToMove.lvl == 0 && indexOfPaketToMove == this.paketeAsTreeView.length - 1) return
      let indexOfPaketUnder = -1
      for (let i = indexOfPaketToMove + 1; indexOfPaketUnder == -1; i++) {
        if (this.paketeAsTreeView[i].lvl == paketToMove.lvl) {
          indexOfPaketUnder = i
        }
      }
      const paketUnder = this.paketeAsTreeView[indexOfPaketUnder]
      const paketToMoveOpenAfter = paketToMove.open
      const paketUnderOpenAfter = paketUnder.open
      if (paketToMove.open) {
        paketToMove.open = false
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      if (paketUnder.open) {
        paketUnder.open = false
        this.updateTreeViewAfterChangedOpenState(paketUnder)
      }
      if (paketToMove.parent != null) {
        const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
        paketToMove.parent.children[indexOfPaketToMoveAsChild] = paketToMove.parent.children[indexOfPaketToMoveAsChild + 1]
        paketToMove.parent.children[indexOfPaketToMoveAsChild + 1] = paketToMove
      }
      indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      indexOfPaketUnder = this.paketeAsTreeView.indexOf(paketUnder)
      this.paketeAsTreeView[indexOfPaketToMove] = paketUnder
      this.paketeAsTreeView[indexOfPaketToMove + 1] = paketToMove
      if (paketToMoveOpenAfter) {
        paketToMove.open = true
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      if (paketUnderOpenAfter) {
        paketUnder.open = true
        this.updateTreeViewAfterChangedOpenState(paketUnder)
      }
    },
    moveRight(id: number) {
      const paketToMove = this.paketeAsMap.get(id)
      if (paketToMove.parent != null && paketToMove.parent.children.indexOf(paketToMove) == paketToMove.parent.children.length - 1) return
      const indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      if (paketToMove.lvl == 0 && indexOfPaketToMove == this.paketeAsTreeView.length - 1) return
      const paketToMoveOpenAfter = paketToMove.open
      if (paketToMove.open) {
        paketToMove.open = false
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      const indexOfNewParent = indexOfPaketToMove + 1
      const newParent = this.paketeAsTreeView[indexOfNewParent]
      if (paketToMove.lvl > 0) {
        const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
        paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1)
      }
      newParent.children.unshift(paketToMove)
      paketToMove.parent = newParent
      const stack = [paketToMove]
      while (stack.length > 0) {
        const aktuellesPaket = stack.pop()
        aktuellesPaket.lvl++
        for (const child of aktuellesPaket.children) {
          stack.push(child)
        }
      }
      this.paketeAsTreeView.splice(indexOfPaketToMove, 1)
      if (!newParent.open) {
        newParent.open = true
        this.updateTreeViewAfterChangedOpenState(newParent)
      } else {
        this.paketeAsTreeView.splice(indexOfNewParent, 0, paketToMove)
      }
      if (paketToMoveOpenAfter) {
        paketToMove.open = true
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
    },
    moveLeft(id: number) {
      const paketToMove = this.paketeAsMap.get(id)
      if (paketToMove.lvl == 0) return
      const indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
      const indexOfParent = this.paketeAsTreeView.indexOf(paketToMove.parent)
      if (paketToMove.lvl >= 1) {
        const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
        paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1)
        if (paketToMove.lvl >= 2) {
          const indexOfParentAsChild = paketToMove.parent.parent.children.indexOf(paketToMove.parent)
          paketToMove.parent.parent.children.splice(indexOfParentAsChild, 0, paketToMove)
        }
      }
      if (paketToMove.parent.children.length == 0) paketToMove.parent.open = false
      const stack = [paketToMove]
      while (stack.length > 0) {
        const aktuellesPaket = stack.pop()
        aktuellesPaket.lvl--
        for (const child of aktuellesPaket.children) {
          stack.push(child)
        }
      }
      const paketToMoveOpenAfter = paketToMove.open
      if (paketToMove.open) {
        paketToMove.open = false
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      this.paketeAsTreeView.splice(indexOfPaketToMove, 1)
      this.paketeAsTreeView.splice(indexOfParent, 0, paketToMove)
      if (paketToMoveOpenAfter) {
        paketToMove.open = true
        this.updateTreeViewAfterChangedOpenState(paketToMove)
      }
      if (paketToMove.lvl == 0) paketToMove.parent = null
      else paketToMove.parent = paketToMove.parent.parent
    }
  }
})