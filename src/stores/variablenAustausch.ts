import { defineStore } from "pinia";
import { ref } from "vue";

export const useVariablenAustauschStore = defineStore("variablenAustausch", () => {
  const geladen = ref<boolean>(false);
  return {
    geladen
  };
});