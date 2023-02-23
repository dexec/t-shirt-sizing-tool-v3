import {createStore} from 'vuex'
import saveFile from './file.json'
/*

var hashmap = new Object();
hashmap.meinAttribut = "Hallo Welt";
hashmap["123"] = "Hallo Welt";
hashmap["Mein tolles Attribut"] = "Hallo Welt";

hashmap.meinAttribut
hashmap.123
hashmap.Mein tolles Attribut



for(paket : pakete)
{
    hashmap[paket.id] = paket;
}
*/

export const store = createStore({
    state() {
        return {
            buckets: saveFile.buckets,
            pakete: saveFile.pakete
        }
    },
    getters: {
        asList(state) {
            const result = [];
            const stack = [];
            for (let paket of state.pakete) {
                paket.lvl = 0;
                stack.push(paket);
            }

            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                //const neuesPaket = new Paket(aktuellesPaket.id, aktuellesPaket.ticket_nr, aktuellesPaket.thema, aktuellesPaket.beschreibung, aktuellesPaket.komponente, aktuellesPaket.bucket, aktuellesPaket.schaetzung, aktuellesPaket.visible, aktuellesPaket.open, aktuellesPaket.children)
                if (aktuellesPaket.children.length > 0) {
                    //aktuellesPaket.children.reverse()
                    for (let i = aktuellesPaket.children.length - 1; i >= 0; i--) {
                        aktuellesPaket.children[i].lvl = aktuellesPaket.lvl + 1;
                        stack.unshift(aktuellesPaket.children[i]);
                    }
                }
                result.push(aktuellesPaket)
            }
            return result
        },
        asTree(state) {
            return state.pakete
        },
        paketWithId: (state) => (id) => {
            const stack = state.pakete;
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                if (aktuellesPaket.id === id) return aktuellesPaket;
                //const neuesPaket = new Paket(aktuellesPaket.id, aktuellesPaket.ticket_nr, aktuellesPaket.thema, aktuellesPaket.beschreibung, aktuellesPaket.komponente, aktuellesPaket.bucket, aktuellesPaket.schaetzung, aktuellesPaket.visible, aktuellesPaket.open, aktuellesPaket.children)
                if (aktuellesPaket.children.length > 0) {
                    //aktuellesPaket.children.reverse()
                    for (let child of aktuellesPaket.children) {
                        stack.unshift(child);
                    }
                }
            }
            return -1;
        }
    },
    mutations: {
        updateAllBuckets(state, newBucketArray) {
            state.buckets = newBucketArray
            /*for (let oldBucket in state.buckets) {
                if (oldBucket.id === bucket.id) {
                    state.buckets[state.buckets.indexOf(oldBucket)] = bucket
                }
            }*/
        },
        updatePaket(state, newPaket) {
            const stack = state.pakete;
            while (stack.length > 0) {
                let aktuellesPaket = stack.shift();
                if (aktuellesPaket.id === newPaket.id) {
                    aktuellesPaket = newPaket;
                    return;
                }
                //const neuesPaket = new Paket(aktuellesPaket.id, aktuellesPaket.ticket_nr, aktuellesPaket.thema, aktuellesPaket.beschreibung, aktuellesPaket.komponente, aktuellesPaket.bucket, aktuellesPaket.schaetzung, aktuellesPaket.visible, aktuellesPaket.open, aktuellesPaket.children)
                if (aktuellesPaket.children.length > 0) {
                    //aktuellesPaket.children.reverse()
                    for (let child of aktuellesPaket.children) {
                        stack.unshift(child);
                    }
                }
            }
        },
        unterElementeInvisibleSchalten(state, wurzel) {
            const stack = wurzel.children;
            while (stack.length > 0) {
                const aktuellesPaket = stack.shift();
                aktuellesPaket.visible = false
                if (aktuellesPaket.children.length > 0) {
                    for (let child of aktuellesPaket.children) {
                        stack.unshift(child);
                    }
                }
            }
        }
    },
    actions: {},
    modules: {}
})