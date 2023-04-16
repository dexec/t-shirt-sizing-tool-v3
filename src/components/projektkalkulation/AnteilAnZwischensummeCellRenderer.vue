<template>
  <div v-if="params.data instanceof Zwischensumme">
    <div
      v-if="params.data.bezeichnung==='STARTSUMME' || params.data.bezeichnung==='ENDSUMME'">
      <p></p>
    </div>
    <div v-else><p class="text-caption pt-2">{{ anteilZwischensumme }}%</p>
      <p></p></div>
  </div>
  <div v-else>
    <p>{{ anteilZwischensumme }}%</p>
  </div>
</template>

<script>
import { Zwischensumme } from "@/Zwischensumme";

export default {
  name: "AnteilAnZwischensummeCellRenderer",
  computed: {
    Zwischensumme() {
      return Zwischensumme;
    },
    anteilZwischensumme() {
      return this.params.data.anteilZwischensumme;
    }
  },
  setup(props) {
    return {
      params: props.params
    };
  }
};
</script>