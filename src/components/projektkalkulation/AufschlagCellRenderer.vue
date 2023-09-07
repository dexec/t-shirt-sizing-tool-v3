<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="vorigerAbschnittAufschlag === null || vorigerAbschnittAufschlag === '' || vorigerAbschnittAufschlag=== 'undefined' || props.params.data.bezeichnung==='STARTSUMME' || props.params.data.bezeichnung==='ENDSUMME'">
      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufschlag }}%</p>
      <p></p>
    </div>
  </div>
  <div v-else>{{ aufschlagWert }}%</div>
</template>
<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";

const projectStore = useProjektStore();
const props = defineProps(['params']);
const aufschlagWert = computed(() => {
  if (props.params.data.isAufschlagBase)
    return props.params.data.aufschlagWert
  else return props.params.data.aufschlagWert.toFixed(projectStore.nachkommastellen)
});
const vorigerAbschnittAufschlag = computed(() => props.params.data.vorigerAbschnittAufschlag.toFixed(projectStore.nachkommastellen));

</script>