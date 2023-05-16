import {defineStore} from "pinia";
import {ref} from "vue";
import type {Paket} from "@/Paket";
import {usePaketeStore} from "@/stores/pakete";

export const useVergleicheStore = defineStore('vergleiche',() => {
    const pakete = usePaketeStore();
    const currentSelectedPaket = ref<Paket>();
    if(!currentSelectedPaket.value) currentSelectedPaket.value = pakete.paketeChildrenWithNoBucket()[0];
    return {
        currentSelectedPaket,
    }
})