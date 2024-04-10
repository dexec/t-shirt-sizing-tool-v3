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

const projektStore = useProjektStore();
const props = defineProps(['params']);

const aufwandAbsolut = computed(() => {
      if (props.params.data.isAufwandRelativBase)
        return Number(props.params.data.aufwandAbsolut).toLocaleString('de',{ minimumFractionDigits: projektStore.nachkommastellen, maximumFractionDigits: projektStore.nachkommastellen })
      else return Number(props.params.data.aufwandAbsolut).toLocaleString()
    });
const vorigerAbschnittAufwandAbsolut = computed(() => Number(props.params.data.vorigerAbschnittAufwandAbsolut).toLocaleString('de',{ minimumFractionDigits: projektStore.nachkommastellen, maximumFractionDigits: projektStore.nachkommastellen }));
const zwischensummeAufwand = computed(() => Number(props.params.data.zwischensummeAufwand).toLocaleString("de", { minimumFractionDigits: projektStore.nachkommastellen, maximumFractionDigits: projektStore.nachkommastellen }));
</script>