<template>
  <div v-if="params.data instanceof Zwischensumme">
    <div v-if="params.data.bezeichnung==='STARTSUMME' || params.data.bezeichnung==='ENDSUMME'">
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufwand }}</p>
      <p class="font-weight-bold">{{ zwischensummeAufwand }}</p>
    </div>
  </div>
  <div v-else>{{ aufwandWert }}</div>
</template>
<script>
import { Zwischensumme } from "@/Zwischensumme";

export default {
  name: "AufwandCellRenderer",
  computed: {
    Zwischensumme() {
      return Zwischensumme;
    },
    aufwandWert() {
      return this.params.data.berechneAufwand()
    },
    vorigerAbschnittAufwand() {
      return this.params.data.vorigerAbschnittAufwand
    },
    zwischensummeAufwand() {
      return this.params.data.zwischensummeAufwand
    }
  },
  setup(props) {
    return {
      params: props.params
    };
  }
};
</script>