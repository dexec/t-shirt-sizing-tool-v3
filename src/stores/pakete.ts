import {defineStore} from 'pinia'
import saveFile from './file.json'
import {Paket} from '@/Paket'

const stackForMap: Paket[] = []
const stackForTreeView: Paket[] = []
const paketeAsTreeView: Paket[] = []

let idCounter = 0

const paketeAsMap = new Map()
for (const paketFile of saveFile.pakete) {
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

for (let i = idCounter; i < 10; i++, idCounter++) {
    const newPaket = new Paket(i, '111', 'Testticket', 'Ticket zum Stresstesten', 'Test', "XL", null, false, 0, null, [])
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
        },
        getFlatView(state) {
            return Array.from(state.paketeAsMap.values())
        },
        getMap(state) {
            return state.paketeAsMap
        },
        getChildren(state) {
            return Array.from(state.paketeAsMap.values()).filter(paket => paket.children.length==0)
        },
        getChildrenWithNoBucket(state) {
            return Array.from(state.paketeAsMap.values()).filter(paket => paket.children.length==0 && paket.bucket == null)
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
        updateLvl(addLvl: number, paket: Paket) {
            const stack = [paket]
            while (stack.length > 0) {
                const aktuellesPaket = stack.pop()
                if (aktuellesPaket != null) {
                    aktuellesPaket.lvl += addLvl
                    for (const child of aktuellesPaket.children) {
                        stack.push(child)
                    }
                }
            }
        },
        deletePaket(id: number) {
            const paketToDelete = this.paketeAsMap.get(id)
            const stack = [paketToDelete]
            let counter = 0
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift()
                this.paketeAsMap.delete(aktuellesPaket.id)
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
            const paketToMoveOpenAfter = paketToMove.open
            if (paketToMove.open) {
                paketToMove.open = false
                this.updateTreeViewAfterChangedOpenState(paketToMove)
            }
            let indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
            if (paketToMove.lvl == 0 && indexOfPaketToMove == this.paketeAsTreeView.length - 1) {
                if (paketToMoveOpenAfter) {
                    paketToMove.open = true
                    this.updateTreeViewAfterChangedOpenState(paketToMove)
                }
                return;
            }
            let indexOfPaketUnder = indexOfPaketToMove + 1;
            const paketUnder = this.paketeAsTreeView[indexOfPaketUnder]
            const paketUnderOpenAfter = paketUnder.open

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
        moveDownRight(id: number) {
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
            this.updateLvl(1, paketToMove)
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
        moveUpRight(id: number) {
            const paketToMove = this.paketeAsMap.get(id)
            if (paketToMove.parent != null && paketToMove.parent.children.indexOf(paketToMove) == 0) return
            const indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
            if (indexOfPaketToMove == 0) return
            // Paket wird geschlossen
            const paketToMoveOpenAfter = paketToMove.open
            if (paketToMove.open) {
                paketToMove.open = false
                this.updateTreeViewAfterChangedOpenState(paketToMove)
            }
            // Wenn Paket ein Elternelement hat, wird es aus dem Elternteil gelöscht
            if (paketToMove.lvl > 0) {
                const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
                paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1)
            }
            // Index vom neuen Elternteil wird gesucht
            let indexOfNewParent = -1
            for (let i = indexOfPaketToMove - 1; indexOfNewParent == -1; i--) {
                if (this.paketeAsTreeView[i].lvl == paketToMove.lvl) {
                    indexOfNewParent = i
                }
            }
            // Paket wird dem neuen Elternteil als Kind zugewiesen
            const newParent = this.paketeAsTreeView[indexOfNewParent]
            newParent.children.unshift(paketToMove)
            //Pakets Elternteil wird neu zugewiesen
            paketToMove.parent = newParent
            // Alle Level von Paket werden erhöht
            this.updateLvl(1, paketToMove)
            // Paket wird aus TreeView entfernt
            this.paketeAsTreeView.splice(indexOfPaketToMove, 1)
            // Neuer Elternteil wird geöffnet
            if (!newParent.open) {
                newParent.open = true
                this.updateTreeViewAfterChangedOpenState(newParent)
            } else {
                // Wenn schon offen, dann wird neues Paket an die Spitze gesetzt
                this.paketeAsTreeView.splice(indexOfNewParent + 1, 0, paketToMove)
            }
            if (paketToMoveOpenAfter) {
                paketToMove.open = true
                this.updateTreeViewAfterChangedOpenState(paketToMove)
            }
        },
        moveLeftUp(id: number) {
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
            this.updateLvl(-1, paketToMove)
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
        },
        moveLeftDown(id: number) {
            const paketToMove = this.paketeAsMap.get(id)
            if (paketToMove.lvl == 0) return
            const indexOfPaketToMove = this.paketeAsTreeView.indexOf(paketToMove)
            const indexOfParent = this.paketeAsTreeView.indexOf(paketToMove.parent)
            if (paketToMove.lvl >= 1) {
                const indexOfPaketToMoveAsChild = paketToMove.parent.children.indexOf(paketToMove)
                paketToMove.parent.children.splice(indexOfPaketToMoveAsChild, 1)
                if (paketToMove.lvl >= 2) {
                    const indexOfParentAsChild = paketToMove.parent.parent.children.indexOf(paketToMove.parent)
                    paketToMove.parent.parent.children.splice(indexOfParentAsChild + 1, 0, paketToMove)
                }
            }
            if (paketToMove.parent.children.length == 0) paketToMove.parent.open = false
            this.updateLvl(-1, paketToMove)
            const paketToMoveOpenAfter = paketToMove.open
            if (paketToMove.open) {
                paketToMove.open = false
                this.updateTreeViewAfterChangedOpenState(paketToMove)
            }
            this.paketeAsTreeView.splice(indexOfPaketToMove, 1)
            const parentOpenAfter = paketToMove.parent.open;
            if (paketToMove.parent.open) {
                paketToMove.parent.open = false
                this.updateTreeViewAfterChangedOpenState(paketToMove.parent)
            }
            this.paketeAsTreeView.splice(indexOfParent+1, 0, paketToMove)
            if (paketToMoveOpenAfter) {
                paketToMove.open = true
                this.updateTreeViewAfterChangedOpenState(paketToMove)
            }
            if (parentOpenAfter) {
                paketToMove.parent.open = true
                this.updateTreeViewAfterChangedOpenState(paketToMove.parent)
            }
            if (paketToMove.lvl == 0) paketToMove.parent = null
            else paketToMove.parent = paketToMove.parent.parent
        }
    }
})