<template>
  <div class="blurred-div" @click="toggleSuche()">
    <div class="content" @click.stop="">
      <v-text-field v-model="suchString" autofocus placeholder="Paket suchen"
                    @update:modelValue="searchPaket"></v-text-field>
      <div v-for="foundPaket of foundPakete" :key="foundPaket.id" class="paket ma-4 mx-auto clickable-element"
           @click="showSearchedPaket(foundPaket)">
        <div class="ticketnr">
          {{ foundPaket.ticket_nr }}
        </div>
        <div class="paketContent">{{foundPaket.beschreibung}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import { usePaketeStore } from "@/stores/pakete";
import { Paket } from "@/Paket";

const paketeStore = usePaketeStore();
const suchString = ref("");
const props = defineProps(["providedFunctionsProp"]);
const toggleSuche = inject(props.providedFunctionsProp.find((func: any) => func.functionName == "toggleSuche").functionName);
const showSearchedPaket = inject(props.providedFunctionsProp.find((func: any) => func.functionName == "showSearchedPaket").functionName);
const foundPakete = ref<Paket[]>([]);

function searchPaket() {
  if (suchString.value != "") {
    foundPakete.value.length = 0;
    for (let paket of paketeStore.paketeAsMap.values()) {
      if (paketeStore.applyFilterOnPaket(paket, suchString.value) && !foundPakete.value.includes(paket)) {
        foundPakete.value.push(paket);
      }
    }
  }
}
</script>

<style scoped>
.blurred-div {
  /* Styles for the blurred div */
  position: absolute;
  inset: 0;
  backdrop-filter: blur();
  z-index: 2002; /* Ensure the blurred div is on top */
  background-color: rgba(12, 3, 3, 0.54); /* Add a semi-transparent background color for better visibility */
}

.content {
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  background-color: white;
  right: 0;
  top: 0;
  width: 30%;
  height: 100%;
}

.paket {
  width: 90%;
  height: 10%;
}

.ticketnr {
  font-size: small;
}
</style>