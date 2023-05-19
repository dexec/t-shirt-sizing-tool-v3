import {defineStore} from "pinia";
import {ref} from "vue";
import type {Paket} from "@/Paket";


export const useVergleicheStore = defineStore('vergleiche', () => {

    const currentSelectedPaket = ref<Paket>();
    const currentSelectedBuckets = ref<number[]>([]);

    return {
        currentSelectedPaket,
        currentSelectedBuckets
    }
})