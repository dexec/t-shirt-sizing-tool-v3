<template>
  <div class="blurred-div" @click="toggleSuche()">
    <div class="content" @click.stop="">
      <v-text-field v-model="suchString" autofocus placeholder="Paket suchen"
                    @update:modelValue="searchPaket"></v-text-field>
      <div v-for="foundPaket of foundPakete" :key="foundPaket.id" class="paket ma-4 mx-auto clickable-element"
           @click="redirect(foundPaket as Paket)">
        <div class="ticketnr">
          {{ foundPaket.ticket_nr }}
        </div>
        <div class="paketContent">
          {{ foundPaket.thema }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue";
import {usePaketeStore} from "@/stores/pakete";
import {Paket} from "@/models/Paket";
import router from "@/router";

const paketeStore = usePaketeStore();
const suchString = ref("");
const props = defineProps(["toggleSuche"]);
const foundPakete = ref<Paket[]>([]);

function redirect(paket: Paket) {
  props.toggleSuche();
  router.push("/pakete/" + paket.id);
}

onMounted(() => {
  searchPaket()
  window.addEventListener("keyup", escapePressed, {capture: true});
});
onUnmounted(() => {
  window.removeEventListener("keyup", escapePressed, {capture: true});
});

function escapePressed(event: any) {
  if (event.key === "Escape") {
    event.preventDefault();
    props.toggleSuche();
  }
}

function searchPaket() {
  if (suchString.value != "") {
    foundPakete.value.length = 0;
    for (let paket of paketeStore.paketeAsMap.values()) {
      if (paketeStore.applyFilterOnPaket(paket as Paket, suchString.value) && !foundPakete.value.includes(paket)) {
        foundPakete.value.push(paket);
      }
    }
  } else {
    foundPakete.value.length = 0;
    paketeStore.paketeAsMap.forEach((value) => foundPakete.value.push(value))
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
  overflow: hidden;
  width: 90%;
  height: 10%;
}

.ticketnr {
  font-size: small;
}
</style>