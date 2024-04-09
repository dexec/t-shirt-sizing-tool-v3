<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p></p>
    </div>
    <div v-else><p class="text-caption pt-2">{{ anteilGesamtprojekt }}%</p>
      <p></p></div>
  </div>
  <div v-else>
    <p>{{ anteilGesamtprojekt }}%</p>
  </div>
</template>

<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";

const projectStore = useProjektStore();
const props = defineProps(['params']);
const anteilGesamtprojekt = computed(() => props.params.data.anteilGesamtprojekt.toFixed(projectStore.nachkommastellen));

</script>