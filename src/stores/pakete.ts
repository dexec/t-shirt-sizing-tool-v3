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
  const paket = new Paket(paketFile.id, paketFile.ticket_nr, paketFile.thema, paketFile.beschreibung, paketFile.komponente, paketFile.bucket, paketFile.schaetzung, paketFile.open, paketFile.lvl, paketFile.children)
  stackForTreeView.push(paket)
  stackForMap.push(paket)
}

while (stackForMap.length > 0) {
  loopCounter++
  const aktuellesPaket = stackForMap.shift()
  if (aktuellesPaket != undefined) {
    if (aktuellesPaket.children.length > 0) {
      for (const child of aktuellesPaket.children) {
        loopCounter++
        stackForMap.push(child)
      }
    }

    aktuellesPaket.id = idCounter++
    paketeAsMap.set(aktuellesPaket.id, aktuellesPaket)
  }
}

while (stackForTreeView.length > 0) {
  loopCounter++
  const aktuellesPaket = stackForTreeView.shift()
  if (aktuellesPaket != undefined) {
    if (aktuellesPaket.children.length > 0) {
      for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
        loopCounter++
        if (aktuellesPaket.open)
          stackForTreeView.unshift(aktuellesPaket.children[i])
      }
    }
    paketeAsTreeView.push(aktuellesPaket)
  }
}

/*for (let i = 0; i < 1000; i++) {
  loopCounter++
  paketeAsTreeView.push({
    id: i,
    ticket_nr: '111',
    thema: 'Testticket',
    beschreibung: 'Ticket zum Stresstesten',
    komponente: 'Test',
    bucket: null,
    schaetzung: null,
    open: false,
    lvl: 0,
    children: []
  })
}*/


export const usePaketeStore = defineStore('pakete', {
  state: () => ({
    paketeAsTreeView: paketeAsTreeView,
    paketeAsMap: paketeAsMap,
    idCounter: 0,
    loopCounter: loopCounter
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
    changeOpenState(changedPaket: Paket) {
      const indexOfChangedPaket = this.paketeAsTreeView.indexOf(changedPaket)
      changedPaket.open = !changedPaket.open
      let counter = 0
      const stack = [...changedPaket.children]
      if (changedPaket.open) {
        while (stack.length > 0) {
          this.loopCounter++
          const aktuellesPaket = stack.shift()
          if (aktuellesPaket != undefined) {
            if (aktuellesPaket.children.length > 0) {
              for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                this.loopCounter++
                if (aktuellesPaket.open) stack.unshift(aktuellesPaket.children[i])
              }
            }
            this.paketeAsTreeView.splice(indexOfChangedPaket + 1 + counter++, 0, aktuellesPaket)
          }
        }
      } else {
        while (stack.length > 0) {
          this.loopCounter++
          const aktuellesPaket = stack.shift()
          if (aktuellesPaket != undefined) {
            if (aktuellesPaket.children.length > 0) {
              for (const child of aktuellesPaket.children) {
                this.loopCounter++
                if (aktuellesPaket.open) stack.unshift(child)
              }
            }
          }
          counter++
        }
        this.paketeAsTreeView.splice(indexOfChangedPaket + 1, counter)
      }
    },
    deletePaket(id: number) {
      const paketToDelete = this.paketeAsMap.get(id)
      const stack = [paketToDelete]
      if (paketToDelete.parent !== null) paketToDelete.parent.children.splice(paketToDelete.parent.children.indexOf(paketToDelete), 1)
      while (stack.length > 0) {
        const aktuellesPaket = stack.shift()
        this.paketeAsTreeView.splice(this.paketeAsTreeView.indexOf(aktuellesPaket), 1)
        for (const child of aktuellesPaket.children) {
          stack.push(child)
        }
      }
      paketToDelete.children = []
    },
    addNew(parent: Paket) {
      const parentOfNewPaket = this.paketeAsMap.get(parent.id)
      parentOfNewPaket.open = true
      const newPaket = new Paket(this.idCounter++, null, null, null, null, null, null, false, parent.lvl + 1, [])
      parentOfNewPaket.children.unshift(newPaket)
      this.paketeAsTreeView.push(newPaket)
    }
  }
})