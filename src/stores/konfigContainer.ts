import { defineStore } from "pinia";
import { ref } from "vue";

export const useKonfigContainer = defineStore("projekt", () => {

  const projektname = ref<string>("");
  const bucketmodus = ref<boolean>(true);
  const nachkommastellen = ref<number>(2);

  return {
    projektname,
    bucketmodus,
    nachkommastellen
  };
});