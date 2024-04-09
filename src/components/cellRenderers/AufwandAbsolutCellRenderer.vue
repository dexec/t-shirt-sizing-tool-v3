<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufwandAbsolut }}</p>
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
  </div>
  <div v-if="!props.params.data.isAufwandRelativBase"> {{ aufwandAbsolut }} *</div>
  <div v-else><div v-if="!props.params.data.isAufwandRelativBase"> {{ aufwandAbsolut }} *</div><div v-else>{{ aufwandAbsolut }}</div></div>
</template>
<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";

const projectStore = useProjektStore();
const props = defineProps(['params']);

const aufwandAbsolut = computed(() => {
      if (props.params.data.isAufwandRelativBase)
        return props.params.data.aufwandAbsolut.toFixed(projectStore.nachkommastellen)
      else return props.params.data.aufwandAbsolut
    });
const vorigerAbschnittAufwandAbsolut = computed(() => props.params.data.vorigerAbschnittAufwandAbsolut.toFixed(projectStore.nachkommastellen));
const zwischensummeAufwand = computed(() => props.params.data.zwischensummeAufwand.toFixed(projectStore.nachkommastellen));
</script>