import {createStore} from 'vuex'
import saveFile from './file.json'

function loadData() {
    const paketeAsList = [];
    const stack = JSON.parse(JSON.stringify(saveFile.pakete));
    let idCounter = 0;
    for (let paket of stack) {
        paket.parent = null;
        paket.lvl = 0;
    }
    while (stack.length > 0) {
        const aktuellesPaket = stack.shift();
        aktuellesPaket.id = idCounter++;
        if (aktuellesPaket.children.length > 0) {
            for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                aktuellesPaket.children[i].lvl = aktuellesPaket.lvl + 1;
                aktuellesPaket.children[i].parent = aktuellesPaket;
                stack.unshift(aktuellesPaket.children[i]);
            }
        }
        paketeAsList.push(aktuellesPaket)
    }
    return paketeAsList
}


export const store = createStore({
    state() {
        return {
            buckets: saveFile.buckets,
            paketeAsList: loadData(),
        }
    },
    getters: {},
    mutations: {
        updateAllBuckets(state, newBucketArray) {
            state.buckets = newBucketArray
        },
        updatePaket(state, newPaket) {
            let oldPaket = state.paketeAsList.find(paket => paket.id === newPaket.id);
            if (typeof oldPaket !== 'undefined') oldPaket = newPaket
        },
        updateUnterPakete(state, wurzel) {
            const wurzelPaket = state.paketeAsList.find(paket => paket.id === wurzel.id);
            if (typeof wurzelPaket !== 'undefined') {
                const stack = [];
                stack.push(wurzelPaket)
                while (stack.length > 0) {
                    const aktuellesPaket = stack.shift();
                    if (aktuellesPaket.children.length > 0) {
                        for (let child of aktuellesPaket.children) {
                            wurzelPaket.open ? child.visible = aktuellesPaket.open : child.visible = wurzelPaket.open;
                            stack.unshift(child);
                        }
                    }
                }
            }
        },
        deletePaket(state, id) {
            const stack = [];
            const paketToDelete = state.paketeAsList[id];
            stack.push(paketToDelete)
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                state.paketeAsList = state.paketeAsList.filter(paket => paket.id !== aktuellesPaket.id)
                for (let i = 0; i < aktuellesPaket.children.length; i++) {
                    stack.push(aktuellesPaket.children[i]);
                }
            }
            for (let i = 0; i < state.paketeAsList.length > 0; i++) {
                state.paketeAsList[i].id = i;
            }
        }
    },
    actions: {},
    modules: {}
})