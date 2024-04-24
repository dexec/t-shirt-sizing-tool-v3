<template>
<!--  <span>
  <span v-if="props.params.value==='Startsumme' || props.params.value==='Endsumme'" class="font-weight-bold">
    {{ params.value }}
  </span>
  <span v-else-if="props.params.data instanceof Zwischensumme">
    <span style="display: block" class="text-caption pt-2">Voriger Abschnitt</span>
    <span class="font-weight-bold">Zwischensumme</span>
  </span>
  <span v-else>{{ props.params.value }}</span>
    </span>-->
  <div class="d-flex flex-nowrap fill-height">
    <template v-if="props.params.data instanceof Zwischensumme && bezeichnung!='Startsumme' && bezeichnung!='Endsumme'">
      <div class="flex-grow-1 pt-3">
        <div class="text-caption">Voriger Abschnitt</div>
        <div class="font-weight-bold">Zwischensumme</div>
      </div>
    </template>
    <template v-else>
      <div class="flex-grow-1">
        <span :class="bezeichnung=='Startsumme' || bezeichnung=='Endsumme'?'font-weight-bold':''"> {{bezeichnung}}</span>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import {Zwischensumme} from "@/models/Zwischensumme";
import { computed } from "vue";

const props = defineProps(['params']);

const bezeichnung = computed(() => props.params.value)
</script>