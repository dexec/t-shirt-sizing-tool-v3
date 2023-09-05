<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.bezeichnung==='STARTSUMME' || props.params.data.bezeichnung==='ENDSUMME'">
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
import {Zwischensumme} from "@/Zwischensumme";
import {computed} from "vue";

const projectStore = useProjektStore();
const props = defineProps(['params']);
const anteilZwischensumme = computed(() => props.params.data.anteilZwischensumme.toFixed(projectStore.nachkommastellen));

</script>