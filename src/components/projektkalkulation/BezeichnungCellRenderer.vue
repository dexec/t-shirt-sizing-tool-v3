<template>
  <div v-if="params.value==='STARTSUMME' || params.value==='ENDSUMME'">
    <p class="font-weight-bold">{{ params.value }}</p>
  </div>
  <div v-else-if="params.data instanceof Zwischensumme">
    <p class="text-caption pt-2">Voriger Abschnitt</p>
    <p class="font-weight-bold">Zwischensumme</p>
  </div>
  <div v-else>{{ params.value }}</div>
</template>
<script>
import { Zwischensumme } from "@/Zwischensumme";

export default {
  name: "BezeichnungCellRenderer",
  computed: {
    Zwischensumme() {
      return Zwischensumme;
    }
  },
  setup(props) {
    return {
      params: props.params
    };
  }
};
</script>