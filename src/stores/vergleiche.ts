import {defineStore} from "pinia";
import {ref} from "vue";

export const useVergleicheStore = defineStore("vergleiche", () => {
        const checkboxSelectedIds = ref<number[]>([]);
        return {
            checkboxSelectedIds
        };
    }
);