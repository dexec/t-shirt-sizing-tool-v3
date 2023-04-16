<template>
  <div v-if="params.data instanceof Zwischensumme">
    <div
      v-if="params.data.bezeichnung==='STARTSUMME' || params.data.bezeichnung==='ENDSUMME'">
      <p></p>
    </div>
    <div v-else><p class="text-caption pt-2">{{ anteilGesamtprojekt }}%</p>
      <p></p></div>
  </div>
  <div v-else>
    <p>{{ anteilGesamtprojekt }}%</p>
  </div>
</template>

<script>
import { Zwischensumme } from "@/Zwischensumme";

export default {
  name: "AnteilAmGesamtprojektCellRenderer",
  computed: {
    Zwischensumme() {
      return Zwischensumme;
    },
    anteilGesamtprojekt() {
      return this.params.data.anteilGesamtprojekt;
    }
  },
  setup(props) {
    return {
      params: props.params
    };
  }
};
</script>