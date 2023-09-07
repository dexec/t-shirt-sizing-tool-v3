<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div v-if="props.params.data.bezeichnung==='STARTSUMME' || props.params.data.bezeichnung==='ENDSUMME'">
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufwand }}</p>
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
  </div>
  <div v-else>{{ aufwandWert }}</div>
</template>
<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";

const projectStore = useProjektStore();
const props = defineProps(['params']);

const aufwandWert = computed(() => {
      if (props.params.data.isAufschlagBase)
        return props.params.data.aufwandWert.toFixed(projectStore.nachkommastellen)
      else return props.params.data.aufwandWert
    });
const vorigerAbschnittAufwand = computed(() => props.params.data.vorigerAbschnittAufwand.toFixed(projectStore.nachkommastellen));
const zwischensummeAufwand = computed(() => props.params.data.zwischensummeAufwand.toFixed(projectStore.nachkommastellen));
</script>