<template>
  <div v-if="showWarning">
    <v-icon icon="mdi-alert "></v-icon>
  </div>
</template>

<script lang="ts" setup>
import { useStatistikenStore } from "@/stores/statistiken";
import type { Paket } from "@/models/Paket";

const statistikenStore = useStatistikenStore();
statistikenStore.berechne();
const props = defineProps(["params"]);
const paket = props.params.data as Paket;
let showWarning: boolean = false;
if (paket.bucket != null && paket.schaetzung != null && paket.zurRechnungFreigegeben()) {
  for (const statistik of statistikenStore.statistiken) {
    if(statistik.bucket.id == paket.bucket.id) continue
    const min = statistik.min;
    const max = statistik.max;
    if (min == null || max == null) continue;
    if (paket.schaetzung >= min && paket.schaetzung <= max) {
      showWarning = true;
      break;
    }
  }
}
</script>

<style scoped>

</style>