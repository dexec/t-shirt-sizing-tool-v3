<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p></p>
    </div>
    <div v-else><p class="text-caption pt-2">{{ anteilZwischensumme }}%</p>
      <p></p></div>
  </div>
  <div v-else>
    <p>{{ anteilZwischensumme }}%</p>
  </div>
</template>

<script lang="ts" setup>
import {useProjektStore} from "@/stores/projekt";
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";

const projektStore = useProjektStore();
const props = defineProps(['params']);
const anteilZwischensumme = computed(() => Number(props.params.data.anteilZwischensumme).toLocaleString('de',{ minimumFractionDigits: projektStore.nachkommastellen, maximumFractionDigits: projektStore.nachkommastellen }));
</script>