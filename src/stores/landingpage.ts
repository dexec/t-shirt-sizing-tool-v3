import {defineStore} from "pinia";
import {ref} from "vue";

export const useLandingpageStore = defineStore("landingpage",()=>{
    const geladen = ref<boolean>(false)
    return {
        geladen
    }
})