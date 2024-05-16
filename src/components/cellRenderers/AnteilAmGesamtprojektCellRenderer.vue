<template>
  <!--  <div v-if="props.params.data instanceof Zwischensumme">
      <div
          v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
        <p></p>
      </div>
      <div v-else>
        <p class="text-caption pt-2">{{ anteilGesamtprojekt }}%
          <EintragErklaerenComponent v-if="selectedColumn == ColumnET.GESAMTPROJEKT"
                                     :node="props.params.node" :api="props.params.api"></EintragErklaerenComponent>
        </p>
        <p></p>
      </div>
    </div>
    <div v-else>
      <p>{{ anteilGesamtprojekt }}%
        <EintragErklaerenComponent v-if="selectedColumn == ColumnET.GESAMTPROJEKT"
                                                              :node="props.params.node" :api="props.params.api"></EintragErklaerenComponent></p>
    </div>-->
  <div class="d-flex flex-nowrap fill-height">
    <div class="flex-grow-1">
      <template v-if="bezeichnung!='Startsumme' && bezeichnung!='Endsumme'">
        <span :class="props.params.data instanceof Zwischensumme?'text-caption':''">{{ anteilGesamtprojekt }}%</span>
      </template>
    </div>
    <div class="align-self-center">
      <EintragErklaerenComponent
        v-if="selectedColumn == ColumnET.GESAMTPROJEKT && bezeichnung!='Startsumme' && bezeichnung!='Endsumme'"
        :api="props.params.api" :node="props.params.node"></EintragErklaerenComponent>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Zwischensumme } from "@/models/Zwischensumme";
import { computed } from "vue";
import { useProjektStore } from "@/stores/projekt";
import { ColumnET } from "@/enums/ColumnET";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";

const projektStore = useProjektStore();
const props = defineProps(["params"]);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell();
  if (focusedCell != null) return focusedCell.column.getColId();
  else return "";
});
const anteilGesamtprojekt = computed(() => Number(props.params.data.anteilGesamtprojekt).toLocaleString("de", {
  minimumFractionDigits: projektStore.nachkommastellen,
  maximumFractionDigits: projektStore.nachkommastellen
}));
const bezeichnung = computed(() => props.params.data.bezeichnung);

</script>