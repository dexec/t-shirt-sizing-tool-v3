import {createStore} from 'vuex'
import saveFile from './file.json'

const stackForMap = JSON.parse(JSON.stringify(saveFile.pakete));
const stackForTreeView = [];
let idCounter = 0;

const map = new Map();
for (let paket of stackForMap) {
    paket.parent = null;
    paket.lvl = 0;
    stackForTreeView.push(paket)
}
while (stackForMap.length > 0) {
    const aktuellesPaket = stackForMap.shift();
    if (aktuellesPaket.children.length > 0) {
        for (let child of aktuellesPaket.children) {
            child.lvl = aktuellesPaket.lvl + 1;
            child.parent = aktuellesPaket;
            stackForMap.push(child);
        }
    }
    aktuellesPaket.id = idCounter++;
    map.set(aktuellesPaket.id, aktuellesPaket);
}

const pakateAsTreeView = [];
while (stackForTreeView.length > 0) {
    const aktuellesPaket = stackForTreeView.shift();
    if (aktuellesPaket.children.length > 0) {
        for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
            if (aktuellesPaket.open)
                stackForTreeView.unshift(aktuellesPaket.children[i]);
        }
    }
    pakateAsTreeView.push(aktuellesPaket)
}

for (let i = 0; i < 1000; i++) {
    pakateAsTreeView.push({
        id: i,
        ticket_nr: 111,
        thema: "Testticket",
        beschreibung: "Ticket zum Stresstesten",
        komponente: "Test",
        bucket: null,
        schaetzung: null,
        visible: null,
        open: false,
        parent: null,
        children: []
    })
}

export const store = createStore({
    state() {
        return {
            buckets: saveFile.buckets,
            paketeAsMap: map,
            paketeAsTreeView: pakateAsTreeView
        }
    },
    getters: {},
    mutations: {
        updateAllBuckets(state, newBucketArray) {
            state.buckets = newBucketArray
        },
        updatePaket(state, newPaket) {
            let oldPaket = state.paketeAsMap.get(newPaket.id)
            if (typeof oldPaket !== 'undefined') oldPaket = newPaket
        },
        changeOpenState(state, changedPaket) {
            const indexOfChangedPaket = state.paketeAsTreeView.indexOf(changedPaket)
            changedPaket.open = !changedPaket.open;
            let counter = 0;
            const stack = [...changedPaket.children];
            if (changedPaket.open) {
                while (stack.length > 0) {
                    const aktuellesPaket = stack.shift();
                    if (aktuellesPaket.children.length > 0) {
                        for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                            if (aktuellesPaket.open) stack.unshift(aktuellesPaket.children[i]);
                        }
                    }
                    state.paketeAsTreeView.splice(indexOfChangedPaket + 1 + counter++, 0, aktuellesPaket)
                }
            }
            else {
                while(stack.length > 0) {
                    const aktuellesPaket = stack.shift();
                    if (aktuellesPaket.children.length > 0) {
                        for (let child of aktuellesPaket.children) {
                            if (aktuellesPaket.open) stack.unshift(child);
                        }
                    }
                    counter++;
                }
                state.paketeAsTreeView.splice(indexOfChangedPaket+1,counter)
            }
        },
        deletePaket(state, id) {
            const paketToDelete = state.paketeAsList.find(paket => paket.id === id);
            const stack = [paketToDelete];
            if (paketToDelete.parent !== null) paketToDelete.parent.children.splice(paketToDelete.parent.children.indexOf(paketToDelete), 1);
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                state.paketeAsList.splice(state.paketeAsList.indexOf(aktuellesPaket), 1);
                for (let child of aktuellesPaket.children) {
                    stack.push(child);
                }
            }
            paketToDelete.children = [];
        },
        addNew(state, parent) {
            const parentOfNewPaket = state.paketeAsList.find(paket => paket.id === parent.id);
            parentOfNewPaket.open = true;
            const newPaket = {
                id: null,
                ticket_nr: null,
                thema: null,
                beschreibung: null,
                komponente: null,
                bucket: null,
                schaetzung: null,
                visible: null,
                open: false,
                parent: parent,
                children: []
            }
            parentOfNewPaket.children.unshift(newPaket);
            state.paketeAsList.push(newPaket);
        }
    },
    actions: {},
    modules: {}
})