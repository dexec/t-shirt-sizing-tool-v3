import { defineStore } from "pinia";
import { ref } from "vue";

export const useProjektStore = defineStore("projekt", () => {

  const projektname = ref<string>("");
  const bucketmodus = ref<boolean>(true);
  const aufschlaegeErklaeren = ref<boolean>(true);
  const nachkommastellen = ref<number>(2);

  return {
    projektname,
    bucketmodus,
    aufschlaegeErklaeren,
    nachkommastellen
  };
});