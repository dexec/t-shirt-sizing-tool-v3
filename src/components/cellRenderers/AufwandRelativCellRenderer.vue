<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.vorigerAbschnittAufwandRelativ === null || props.params.data.vorigerAbschnittAufwandRelativ === '' || props.params.data.vorigerAbschnittAufwandRelativ=== 'undefined' || props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ vorigerAbschnittAufwandRelativ }}%
        <EintragErklaerenComponent v-if="selectedColumn == ColumnET.AUFSCHLAG"
                                   :node="props.params.node"></EintragErklaerenComponent>
      </p>
      <p></p>
    </div>
  </div>
  <div v-else>
    <div v-if="props.params.data.isAufwandRelativBase"> {{ aufwandRelativ }}% *
      <EintragErklaerenComponent v-if="selectedColumn == ColumnET.AUFSCHLAG" :node="props.params.node"></EintragErklaerenComponent>
    </div>
    <div v-else>{{ aufwandRelativ }}%
      <EintragErklaerenComponent v-if="selectedColumn == ColumnET.AUFSCHLAG" :node="props.params.node"></EintragErklaerenComponent>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";
import {Zwischensumme} from "@/models/Zwischensumme";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";
import {ColumnET} from "@/enums/ColumnET";

const projektStore = useProjektStore();
const props = defineProps(['params']);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell()
  if(focusedCell != null) return focusedCell.column.getColId();
  else return ""
})
const aufwandRelativ = computed(() => {
  if (props.params.data.isAufwandRelativBase)
    return Number(props.params.data.aufwandRelativ).toLocaleString();
  else return Number(props.params.data.aufwandRelativ).toLocaleString('de', {
    minimumFractionDigits: projektStore.nachkommastellen,
    maximumFractionDigits: projektStore.nachkommastellen
  });
});
const vorigerAbschnittAufwandRelativ = computed(() => Number(props.params.data.vorigerAbschnittAufwandRelativ).toLocaleString('de', {
  minimumFractionDigits: projektStore.nachkommastellen,
  maximumFractionDigits: projektStore.nachkommastellen
}));

</script>
<style scoped>

</style>