<template>
  <div v-if="params.data instanceof Zwischensumme">
    <div
        v-if="vorigerAbschnittAufschlag === null || vorigerAbschnittAufschlag === '' || vorigerAbschnittAufschlag=== 'undefined' || params.data.bezeichnung==='STARTSUMME' || params.data.bezeichnung==='ENDSUMME'">
      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ params.data.vorigerAbschnittAufschlag }}%</p>
      <p></p>
    </div>
  </div>
  <div v-else>{{ aufschlagWert }}%</div>
</template>
<script>
import {Zwischensumme} from "@/Zwischensumme";

export default {
  name: "AufschlagCellRenderer",
  computed: {
    Zwischensumme() {
      return Zwischensumme;
    },
    aufschlagWert() {
      return this.params.data.aufschlagWert
    },
    vorigerAbschnittAufschlag() {
      return this.params.data.vorigerAbschnittAufschlag;
    }
  },
  setup(props) {
    return {
      params: props.params
    };
  }
};
</script>