<template>
  <div v-if="props.params.value==='Startsumme' || props.params.value==='Endsumme'">
    <p class="font-weight-bold">{{ params.value }}</p>
  </div>
  <div v-else-if="props.params.data instanceof Zwischensumme">
    <p class="text-caption pt-2">Voriger Abschnitt</p>
    <p class="font-weight-bold">Zwischensumme</p>
  </div>
  <div v-else>{{ props.params.value }}</div>
</template>
<script setup lang="ts">
import {Zwischensumme} from "@/models/Zwischensumme";

const props = defineProps(['params']);
</script>