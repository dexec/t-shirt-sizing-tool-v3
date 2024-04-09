<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.vorigerAbschnittAufwandRelativ === null || props.params.data.vorigerAbschnittAufwandRelativ === '' || props.params.data.vorigerAbschnittAufwandRelativ=== 'undefined' || props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufwandRelativ }}%</p>
      <p></p>
    </div>
  </div>
  <div v-else>
    <div v-if="props.params.data.isAufwandRelativBase"> {{ aufwandRelativ }}% *</div>
    <div v-else>{{ aufwandRelativ }}%</div>
  </div>
</template>
<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";

const projectStore = useProjektStore();
const props = defineProps(['params']);
const aufwandRelativ = computed(() => {
  if (props.params.data.isAufwandRelativBase)
    return props.params.data.aufwandRelativ
  else return props.params.data.aufwandRelativ.toFixed(projectStore.nachkommastellen)
});
const vorigerAbschnittAufwandRelativ = computed(() => props.params.data.vorigerAbschnittAufwandRelativ.toFixed(projectStore.nachkommastellen));

</script>