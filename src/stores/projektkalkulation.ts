import {defineStore} from "pinia";
import {ref} from "vue";

export const useProjektkalkulationStore = defineStore("projektkalkulation", () => {

    const currentSelectedRow = ref(-1);
    const currentSelectedColumn = ref("")
    const erklaerungsText = ref("");
    const erklaerungsTextZusatz = ref("");
    const erklaerungsRechnung = ref("");
    const erklaerungsRechnungZusatz = ref("");
    const colorCells = ref(false);
    const explain = ref(false);
    function getFullText(): string {
        return erklaerungsRechnung.value + "\n" +  erklaerungsRechnungZusatz.value
    }

    function clearErklaerungen() {
        erklaerungsText.value = "";
        erklaerungsTextZusatz.value = "";
        erklaerungsRechnung.value = "";
        erklaerungsRechnungZusatz.value = "";
        explain.value = false;
        colorCells.value = false;
    }

    return {
        currentSelectedRow,
        currentSelectedColumn,
        erklaerungsText,
        erklaerungsTextZusatz,
        erklaerungsRechnung,
        erklaerungsRechnungZusatz,
        colorCells,
        explain,
        clearErklaerungen,
        getFullText
    };
});