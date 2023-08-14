import { defineStore } from "pinia";
import { ref } from "vue";

export const useVariablenAustauschStore = defineStore("variablenAustausch", () => {
  const geladen = ref<boolean>(false);
  const searchPaketString = ref<string>("");
  return {
    geladen,
    searchPaketString
  };
});