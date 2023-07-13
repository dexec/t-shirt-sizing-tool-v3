import {defineStore} from "pinia";
import {ref} from "vue";

export const useProjektStore = defineStore('projekt', () => {
    const projektname = ref<string>("");
    const projektbeschreibung = ref<string>("");
    const bucketmodus = ref<boolean>(true);
    const geladen = ref<boolean>(false)
    return {
        geladen,
        projektname,
        projektbeschreibung,
        bucketmodus
    }
})