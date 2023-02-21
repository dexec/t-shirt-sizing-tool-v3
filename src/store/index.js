import {createStore} from 'vuex'
import saveFile from './file.json'
import Paket from '../Paket.js'

export const store = createStore({
    state() {
        return {
            buckets: saveFile.buckets,
            pakete: saveFile.pakete,
            testBuckets: [
                {
                    id: 0,
                    name: 'XXL'
                },
                {
                    id: 1,
                    name: 'abc'
                }
            ]
        }
    },
    getters: {
        asList(state) {
            const result = [];
            const stack = [];
            for (let paket of state.pakete) {
                stack.push(paket)
            }
            while (stack.length > 0) {
                const aktuellesPaket = stack.pop();
                const neuesPaket = new Paket(aktuellesPaket.id, aktuellesPaket.ticket_nr, aktuellesPaket.thema, aktuellesPaket.beschreibung, aktuellesPaket.komponente, aktuellesPaket.bucket, aktuellesPaket.schaetzung, aktuellesPaket.children)
                if (aktuellesPaket.children.length > 0) {
                    for (let paketChild of aktuellesPaket.children)
                        stack.push(paketChild)
                }
                result.push(neuesPaket)
            }
            console.log("debug")
            return result
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
        updateTestBucket(state, name) {
            state.testBuckets[0].name = name
        }
    },
    actions: {},
    modules: {}
})