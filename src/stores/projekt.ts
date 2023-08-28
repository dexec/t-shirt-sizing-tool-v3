import { defineStore } from "pinia";
import { ref } from "vue";
import { RundungsartET } from "@/enums/RundungsartET";

export const useProjektStore = defineStore("projekt", () => {

  const projektname = ref<string>("");
  const projektbeschreibung = ref<string>("");
  const bucketmodus = ref<boolean>(false);
  const rundungsart = ref(RundungsartET.KAUFMAENNISCH);
  const nachkommastellen = ref<number>(2);

  return {
    projektname,
    projektbeschreibung,
    bucketmodus,
    rundungsart,
    nachkommastellen
  };
});