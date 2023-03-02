import {createStore} from 'vuex'
import saveFile from './file.json'

function loadData() {
    const stack = JSON.parse(JSON.stringify(saveFile.pakete));
    const result = [];
    for (let paket of stack) {
        paket.parent = null;
        paket.lvl = 0;
    }
    while (stack.length > 0) {
        const aktuellesPaket = stack.shift();
        for (let child of aktuellesPaket.children) {
            child.lvl = aktuellesPaket.lvl + 1;
            child.parent = aktuellesPaket;
            stack.push(child);
        }
        result.push(aktuellesPaket)
    }
    for (let i = 0; i < 1000; i++) {
        result.push({
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
    return result
}

export const store = createStore({
    state() {
        return {
            buckets: saveFile.buckets,
            paketeAsList: loadData(),
            paketeAsSortedList: () => { return []; }
        }
    },
    getters: {
        paketeAsSortedList(state) {
            console.log("getter")
            let idCounter = 0;
            const result = [];
            const stack = state.paketeAsList.filter(paket => paket.parent === null);
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                if (aktuellesPaket.open && aktuellesPaket.children.length > 0) {
                    for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                        aktuellesPaket.children[i].lvl = aktuellesPaket.lvl + 1;
                        aktuellesPaket.children[i].parent = aktuellesPaket;
                        stack.unshift(aktuellesPaket.children[i]);
                    }
                }
                aktuellesPaket.id = idCounter++;
                result.push(aktuellesPaket)
            }
            return result
        }
    },
    mutations: {
        updateAllBuckets(state, newBucketArray) {
            state.buckets = newBucketArray
        },
        updatePaket(state, newPaket) {
            let oldPaket = state.paketeAsList[newPaket.id]
            if (typeof oldPaket !== 'undefined') oldPaket = newPaket
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
            state.paketeAsList.push(newPaket)
        }
    },
    actions: {},
    modules: {}
})