<template>
  <div v-if="showWarning">
    <v-icon icon="mdi-alert "></v-icon>
  </div>
</template>

<script lang="ts" setup>
import { useStatistikenStore } from "@/stores/statistikenService";
import type { Paket } from "@/models/Paket";
import {useBucketContainer} from "@/stores/bucketContainer";
import type {Bucket} from "@/models/Bucket";
const bucketContainer = useBucketContainer();
const statistikenStore = useStatistikenStore();
const props = defineProps(["params"]);
const paket = props.params.data as Paket;
let showWarning: boolean = false;
if (paket.bucket != null && paket.schaetzung != null && paket.zurRechnungFreigegeben()) {
  for (const bucket of bucketContainer.bucketsAsSortedArray) {
    if(bucket.id == paket.bucket.id) continue
    const min = statistikenStore.min(bucket as Bucket);
    const max = statistikenStore.max(bucket as Bucket);
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