<template>
  <!--  <span>
    <template v-if="props.params.data instanceof Zwischensumme">
      <span
        v-if="props.params.data.vorigerAbschnittAufwandRelativ === null || props.params.data.vorigerAbschnittAufwandRelativ === '' || props.params.data.vorigerAbschnittAufwandRelativ=== 'undefined' || props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      </span>
      <span v-else>
        <span class="text-caption pt-2">{{ vorigerAbschnittAufwandRelativ }}%
        </span>
      </span>
    </template>
    <template v-else>
      <span> {{ aufwandRelativ }}% <template v-if="props.params.data.isAufwandRelativBase"> *</template></span>
    </template>
    <EintragErklaerenComponent
                               v-if="selectedColumn == ColumnET.AUFSCHLAG && props.params.data.bezeichnung!='Startsumme' && props.params.data.bezeichnung!='Endsumme'"
      :api="props.params.api" :node="props.params.node"></EintragErklaerenComponent>
    </span>-->
  <div class="d-flex flex-nowrap fill-height">
    <template v-if="props.params.data instanceof Zwischensumme">
      <template v-if="vorigerAbschnittAufwandRelativ != '' && bezeichnung!='Startsumme' && bezeichnung != 'Endsumme'">
        <div class="flex-grow-1">
          <span class="text-caption">{{ vorigerAbschnittAufwandRelativ }}%</span>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex-grow-1"> {{ aufwandRelativ }}%
        <template v-if="props.params.data.isAufwandRelativBase">
          <v-icon class="ml-3" icon="mdi-pencil"></v-icon>
        </template>
      </div>
    </template>
    <div class="align-self-center">
      <EintragErklaerenComponent
        v-if="selectedColumn == ColumnET.AUFSCHLAG && bezeichnung!='Startsumme' && bezeichnung!='Endsumme'"
        :api="props.params.api"
        :node="props.params.node" ></EintragErklaerenComponent>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useProjektStore } from "@/stores/projekt";
import { Zwischensumme } from "@/models/Zwischensumme";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";
import { ColumnET } from "@/enums/ColumnET";

const projektStore = useProjektStore();
const props = defineProps(["params"]);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell();
  if (focusedCell != null) return focusedCell.column.getColId();
  else return "";
});
const aufwandRelativ = computed(() => {
  if (props.params.data.isAufwandRelativBase)
    return Number(props.params.data.aufwandRelativ).toLocaleString();
  else return Number(props.params.data.aufwandRelativ).toLocaleString("de", {
    minimumFractionDigits: projektStore.nachkommastellen,
    maximumFractionDigits: projektStore.nachkommastellen
  });
});
const vorigerAbschnittAufwandRelativ = computed(() => Number(props.params.data.vorigerAbschnittAufwandRelativ).toLocaleString("de", {
  minimumFractionDigits: projektStore.nachkommastellen,
  maximumFractionDigits: projektStore.nachkommastellen
}));
const bezeichnung = computed(() => props.params.data.bezeichnung);

</script>
<style scoped>

</style>